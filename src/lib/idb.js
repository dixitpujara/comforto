// Minimal promise wrapper over IndexedDB — no dependency, three stores:
//
//   quotes  keyPath 'id'   full quotation records (items, photos, customer)
//   kv      keyPath 'key'  small singletons: the in-progress collection draft
//   outbox  autoIncrement  writes made offline, replayed when the API returns
//
// IndexedDB is used rather than localStorage because quotes carry inline photos:
// localStorage is a ~5MB string store shared with everything else, and blowing
// its quota used to take the whole app down. IndexedDB has a far larger budget
// and stores structured values directly.
//
// Some browsers deny IndexedDB entirely (private mode, locked-down webviews), so
// every call falls back to a localStorage-backed shim with the same shape. The
// app keeps working; it just inherits the smaller budget again.

const DB_NAME = 'comforto';
const DB_VERSION = 1;

export const STORE_QUOTES = 'quotes';
export const STORE_KV     = 'kv';
export const STORE_OUTBOX = 'outbox';

const KEY_PATHS = { [STORE_QUOTES]: 'id', [STORE_KV]: 'key' };

let dbPromise = null;
let useShim = false;

const openDB = () => {
  if (useShim) return Promise.reject(new Error('IndexedDB unavailable'));
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('No IndexedDB')); return; }
    let request;
    try { request = indexedDB.open(DB_NAME, DB_VERSION); }
    catch (e) { reject(e); return; }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_QUOTES)) db.createObjectStore(STORE_QUOTES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_KV))     db.createObjectStore(STORE_KV,     { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) db.createObjectStore(STORE_OUTBOX, { keyPath: 'seq', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror   = () => reject(request.error || new Error('IndexedDB open failed'));
    request.onblocked = () => reject(new Error('IndexedDB blocked'));
  }).catch(err => {
    useShim = true;
    dbPromise = null;
    throw err;
  });

  return dbPromise;
};

const run = (storeName, mode, fn) =>
  openDB().then(db => new Promise((resolve, reject) => {
    const tx = tx0(db, storeName, mode, reject);
    if (!tx) return;
    const request = fn(tx.objectStore(storeName));
    tx.oncomplete = () => resolve(request ? request.result : undefined);
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
  }));

const tx0 = (db, storeName, mode, reject) => {
  try { return db.transaction(storeName, mode); }
  catch (e) { reject(e); return null; }
};

// ── localStorage shim, same five operations ───────────────────────────

const shimKey = (store) => `comforto_idb_${store}`;
const shimRead = (store) => {
  try { const v = JSON.parse(localStorage.getItem(shimKey(store)) || '[]'); return Array.isArray(v) ? v : []; }
  catch { return []; }
};
const shimWrite = (store, rows) => {
  try { localStorage.setItem(shimKey(store), JSON.stringify(rows)); } catch { /* over quota — drop silently */ }
  return rows;
};
const shimId = (store, row, index) => (KEY_PATHS[store] ? row[KEY_PATHS[store]] : index);

const shim = {
  getAll: (store) => shimRead(store),
  get:    (store, key) => shimRead(store).find((r, i) => shimId(store, r, i) === key) || undefined,
  put:    (store, value) => {
    const rows = shimRead(store);
    const path = KEY_PATHS[store];
    if (path) {
      const at = rows.findIndex(r => r[path] === value[path]);
      if (at >= 0) rows[at] = value; else rows.push(value);
    } else {
      rows.push({ ...value, seq: (rows[rows.length - 1]?.seq || 0) + 1 });
    }
    shimWrite(store, rows);
    return value;
  },
  del: (store, key) => shimWrite(store, shimRead(store).filter((r, i) => shimId(store, r, i) !== key)),
  clear: (store) => shimWrite(store, []),
};

// ── Public API ────────────────────────────────────────────────────────

export const idbGetAll = (store) =>
  run(store, 'readonly', s => s.getAll()).catch(() => shim.getAll(store));

export const idbGet = (store, key) =>
  run(store, 'readonly', s => s.get(key)).catch(() => shim.get(store, key));

export const idbPut = (store, value) =>
  run(store, 'readwrite', s => s.put(value)).then(() => value).catch(() => shim.put(store, value));

export const idbDelete = (store, key) =>
  run(store, 'readwrite', s => s.delete(key)).catch(() => shim.del(store, key));

export const idbClear = (store) =>
  run(store, 'readwrite', s => s.clear()).catch(() => shim.clear(store));

/** True when real IndexedDB is in use (false once the shim has taken over). */
export const idbAvailable = async () => {
  try { await openDB(); return true; } catch { return false; }
};
