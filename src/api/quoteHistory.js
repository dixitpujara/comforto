// Recent-quote history — the most recent quotations staff generated, so a quote
// can be reopened and updated days later instead of rebuilt from scratch.
//
// Backed by /api/quotes (Vercel KV) so the same list appears for every signed-in
// staff member on any device. During local `vite dev` — and if the network or
// the store is unavailable — it falls back to this browser's localStorage, the
// same pattern the catalog and users already use.
//
// listQuotes() returns light summaries; getQuote(id) returns the full record
// (items, photos, customer, totals). Records with inline photos run to a few
// hundred KB, so the list must never carry them.

import { apiGet, apiPost, apiDelete, ApiUnavailable, ApiError } from './client';

const STORAGE_KEY = 'comforto_quotes_v1';

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

// ── Local fallback (per-browser) ──────────────────────────────────────

const readLocal = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const stripPhotos = (record) => ({
  ...record,
  items: (record.items || []).map(i => ({
    ...i,
    image:         String(i.image || '').startsWith('data:')         ? '' : i.image,
    materialImage: String(i.materialImage || '').startsWith('data:') ? '' : i.materialImage
  }))
});

// Photo-heavy quotes can push the browser past its storage quota. Shed the
// oldest records first, then inline photos, rather than letting the write throw
// — losing an old quote beats losing the whole history.
const writeLocal = (list) => {
  const attempt = (candidate) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
    return candidate;
  };

  try { return attempt(list); } catch { /* over quota — start shedding */ }

  const trimmed = [...list];
  while (trimmed.length > 1) {
    trimmed.pop();
    try { return attempt(trimmed); } catch { /* keep shedding */ }
  }

  try { return attempt(list.map(stripPhotos)); } catch { /* give up quietly */ }
  return list;
};

// ── Sync state ────────────────────────────────────────────────────────
// Whether the last call actually reached the shared store. An empty list looks
// identical whether nothing is saved or the device can't reach the server, so
// the page needs to be able to tell the difference and say so.

let syncState = { shared: false, reason: 'unknown' };

export const getSyncState = () => syncState;

const noteFailure = (e) => {
  if (e instanceof ApiUnavailable)          syncState = { shared: false, reason: 'offline' };
  else if (e instanceof ApiError && e.status === 401)
                                            syncState = { shared: false, reason: 'signin' };
  else                                      syncState = { shared: false, reason: 'error', message: e?.message || '' };
  return syncState;
};

// ── Public API — server first, local fallback ─────────────────────────
// Every call falls back to this browser's own list on ANY failure. A 401 (no
// server session) or 500 (no store connected) must degrade the same way a
// dropped connection does, never leave the caller with a rejected promise.

/** Saved quotes as light summaries, newest first. */
export async function listQuotes() {
  try {
    const index = await apiGet('/api/quotes');
    syncState = { shared: true, reason: 'ok' };
    return Array.isArray(index) ? index : [];
  } catch (e) {
    noteFailure(e);
    return readLocal().map(summarize);
  }
}

/** The full record for one quote, or null. */
export async function getQuote(id) {
  try {
    const record = await apiGet(`/api/quotes?id=${encodeURIComponent(id)}`);
    syncState = { shared: true, reason: 'ok' };
    return record;
  } catch (e) {
    noteFailure(e);
    return readLocal().find(q => q.id === id) || null;
  }
}

/**
 * Insert or update a quote and keep only the newest MAX_QUOTES.
 * Records are matched by id, so re-sending a reopened quote updates it in place
 * rather than filling the list with revisions of the same job.
 */
export async function saveQuote(record) {
  try {
    const index = await apiPost('/api/quotes', record);
    syncState = { shared: true, reason: 'ok' };
    return Array.isArray(index) ? index : [];
  } catch (e) {
    noteFailure(e);
    // Keep it on this device at least — the quote is never dropped on the floor.
    const rest = readLocal().filter(q => q.id !== record.id);
    return writeLocal([record, ...rest].slice(0, MAX_QUOTES)).map(summarize);
  }
}

export async function deleteQuote(id) {
  try {
    const index = await apiDelete(`/api/quotes?id=${encodeURIComponent(id)}`);
    syncState = { shared: true, reason: 'ok' };
    return Array.isArray(index) ? index : [];
  } catch (e) {
    noteFailure(e);
    return writeLocal(readLocal().filter(q => q.id !== id)).map(summarize);
  }
}
