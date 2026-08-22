// Recent-quote history — offline-first.
//
// IndexedDB is the working copy: reads answer from it immediately, writes land
// in it before anything touches the network, so the page never waits on — or
// loses work to — a flaky connection. Every write is also queued in an outbox
// and replayed against /api/quotes (Vercel KV) when the API is reachable, which
// is what makes a quote saved on one device appear on another.
//
// listQuotes() returns light summaries; getQuote(id) returns the full record.
// Records carry inline photos and run to a few hundred KB, so the list must
// never carry them.

import { apiGet, apiPost, apiDelete, ApiUnavailable, ApiError } from './client';
import { idbGetAll, idbGet, idbPut, idbDelete, STORE_QUOTES, STORE_OUTBOX } from '../lib/idb';

const LEGACY_KEY = 'comforto_quotes_v1';

export const MAX_QUOTES = 25;

// Display form of a quote number: revision 1 prints bare, later revisions carry
// an -R suffix so the customer can tell which PDF is the newest.
export const formatQuoteNo = (quoteNo, revision) =>
  Number(revision) > 1 ? `${quoteNo}-R${revision}` : quoteNo;

export const summarize = (q) => ({
  id: q.id,
  quoteNo: q.quoteNo,
  revision: Number(q.revision) || 1,
  printedNo: q.printedNo || q.quoteNo,
  savedAt: q.savedAt,
  grandTotal: Number(q.grandTotal) || 0,
  customerName: q.customer?.name || '',
  projectName: q.customer?.projectName || '',
  itemCount: Array.isArray(q.items) ? q.items.length : 0,
});

const byNewest = (a, b) => String(b.savedAt || '').localeCompare(String(a.savedAt || ''));

// ── Sync state ────────────────────────────────────────────────────────
// An empty list looks identical whether nothing is saved or this device cannot
// reach the shared store, so the page needs to be able to tell them apart.

let syncState = { shared: false, reason: 'unknown', pending: 0 };
const listeners = new Set();

export const getSyncState = () => syncState;

/** Subscribe to sync-state changes. Returns an unsubscribe function. */
export const onSyncChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

const setSync = (next) => {
  syncState = { ...syncState, ...next };
  listeners.forEach(fn => { try { fn(syncState); } catch { /* listener's problem */ } });
};

const noteFailure = (e) => {
  if (e instanceof ApiUnavailable)                     setSync({ shared: false, reason: 'offline' });
  else if (e instanceof ApiError && e.status === 401)  setSync({ shared: false, reason: 'signin' });
  else                                                 setSync({ shared: false, reason: 'error', message: e?.message || '' });
};

// ── Local working copy ────────────────────────────────────────────────

const localQuotes = async () => (await idbGetAll(STORE_QUOTES) || []).sort(byNewest);

// One-time import of quotes saved before IndexedDB, so nobody loses their
// history when this version lands.
let migrated = false;
const migrateLegacy = async () => {
  if (migrated) return;
  migrated = true;
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]'); } catch { return; }
  if (!Array.isArray(legacy) || !legacy.length) return;

  const existing = new Set((await idbGetAll(STORE_QUOTES) || []).map(q => q.id));
  for (const record of legacy) {
    if (record?.id && !existing.has(record.id)) {
      await idbPut(STORE_QUOTES, record);
      await queue({ op: 'save', record });   // push them up to the shared store too
    }
  }
  try { localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
};

const trimLocal = async () => {
  const all = await localQuotes();
  for (const extra of all.slice(MAX_QUOTES)) await idbDelete(STORE_QUOTES, extra.id);
};

// ── Outbox ────────────────────────────────────────────────────────────

const queue = (entry) => idbPut(STORE_OUTBOX, { ...entry, queuedAt: new Date().toISOString() });

const pendingCount = async () => (await idbGetAll(STORE_OUTBOX) || []).length;

let flushing = null;

/**
 * Replay queued writes against the API, oldest first. Stops at the first
 * failure so ordering is preserved and nothing is dropped. Safe to call often.
 */
export async function flushOutbox() {
  if (flushing) return flushing;
  flushing = (async () => {
    const entries = (await idbGetAll(STORE_OUTBOX) || []).sort((a, b) => (a.seq || 0) - (b.seq || 0));
    for (const entry of entries) {
      try {
        if (entry.op === 'save')        await apiPost('/api/quotes', entry.record);
        else if (entry.op === 'delete') await apiDelete(`/api/quotes?id=${encodeURIComponent(entry.id)}`);
        await idbDelete(STORE_OUTBOX, entry.seq);
        setSync({ shared: true, reason: 'ok' });
      } catch (e) {
        noteFailure(e);
        break;                       // still offline / still refused — try again later
      }
    }
    setSync({ pending: await pendingCount() });
  })().finally(() => { flushing = null; });
  return flushing;
}

// ── Public API ────────────────────────────────────────────────────────

/** Saved quotes as light summaries, newest first — answered from this device. */
export async function listQuotes() {
  await migrateLegacy();
  return (await localQuotes()).slice(0, MAX_QUOTES).map(summarize);
}

/**
 * Reconcile with the shared store: push anything queued, pull everyone else's
 * quotes, and return the merged list. Falls back to the local list if the API
 * can't be reached, so callers can use it exactly like listQuotes().
 */
export async function syncQuotes() {
  await migrateLegacy();
  await flushOutbox();

  try {
    const index = await apiGet('/api/quotes');
    if (Array.isArray(index)) {
      const local = await localQuotes();
      const localById = new Map(local.map(q => [q.id, q]));
      const queued = new Set(((await idbGetAll(STORE_OUTBOX)) || []).map(e => e.record?.id || e.id));

      // Pull down records this device has never seen. Summaries are enough for
      // the list; the full record is fetched on demand when a quote is opened.
      for (const summary of index) {
        if (!localById.has(summary.id)) await idbPut(STORE_QUOTES, { ...summary, partial: true });
      }
      // Drop local copies the server no longer has — unless we're still holding
      // an unsent write for them.
      const serverIds = new Set(index.map(q => q.id));
      for (const q of local) {
        if (!serverIds.has(q.id) && !queued.has(q.id)) await idbDelete(STORE_QUOTES, q.id);
      }
      setSync({ shared: true, reason: 'ok', pending: await pendingCount() });
    }
  } catch (e) {
    noteFailure(e);
    setSync({ pending: await pendingCount() });
  }

  await trimLocal();
  return (await localQuotes()).slice(0, MAX_QUOTES).map(summarize);
}

/** The full record for one quote, or null. */
export async function getQuote(id) {
  const local = await idbGet(STORE_QUOTES, id);
  if (local && !local.partial) return local;

  try {
    const record = await apiGet(`/api/quotes?id=${encodeURIComponent(id)}`);
    if (record) { await idbPut(STORE_QUOTES, record); setSync({ shared: true, reason: 'ok' }); }
    return record;
  } catch (e) {
    noteFailure(e);
    return local || null;            // a summary is better than nothing
  }
}

/**
 * Insert or update a quote. Stored locally first — this never fails on a bad
 * connection — then queued for the shared store.
 */
export async function saveQuote(record) {
  await idbPut(STORE_QUOTES, record);
  await queue({ op: 'save', record });
  await trimLocal();
  setSync({ pending: await pendingCount() });
  flushOutbox();                     // fire and forget; the list is already correct
  return (await localQuotes()).slice(0, MAX_QUOTES).map(summarize);
}

export async function deleteQuote(id) {
  await idbDelete(STORE_QUOTES, id);
  await queue({ op: 'delete', id });
  setSync({ pending: await pendingCount() });
  flushOutbox();
  return (await localQuotes()).slice(0, MAX_QUOTES).map(summarize);
}
