// Service-worker registration and connectivity plumbing.
//
// Registered only in production builds: under `vite dev` a worker caching the
// module graph fights hot reload and hides source changes.

import { flushOutbox, syncQuotes } from '../api/quoteHistory';

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/';
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .catch(() => { /* unsupported or blocked — the app still works online */ });
  });
}

/**
 * Ask the browser to treat our storage as persistent, so quotes and the cached
 * app aren't evicted when space runs low. Chrome/Android grants this to
 * installed apps; Safari ignores it, where a Home Screen install is what buys
 * the same protection.
 */
export async function requestPersistentStorage() {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

const IMAGE_CACHE = 'comforto-images';

/**
 * Drop a photo from the cache.
 *
 * Cross-origin image responses are opaque, which means status 0 whether the CDN
 * answered 200 or 404 — the service worker cannot tell them apart and will
 * happily store a dead URL as though it were a picture, forever. The page can
 * tell, because it knows whether the image decoded, so undecodable entries are
 * evicted from here.
 */
export async function forgetCachedImage(url) {
  try {
    if (!('caches' in window) || !url) return;
    const cache = await caches.open(IMAGE_CACHE);
    await cache.delete(url, { ignoreVary: true });
  } catch { /* nothing to clean up */ }
}

/**
 * Pull product photos into the cache while there's a connection. They're hosted
 * off-site, so without this the catalog loses its pictures the moment the site
 * is unreachable. Requests go out no-cors and the responses are opaque — the
 * service worker stores them anyway, which is the whole point.
 */
export async function warmImageCache(urls) {
  if (!import.meta.env.PROD) return 0;
  if (!('caches' in window) || !navigator.onLine) return 0;

  const unique = [...new Set((urls || []).filter(u => /^https?:/i.test(u)))];
  let warmed = 0;

  // Loaded as real images, not fetch(): the service worker recognises photos by
  // request.destination, and these URLs carry no file extension to match on.
  // This also guarantees the cache entry is keyed exactly like the request the
  // catalog will make later.
  const load = (url) => new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });

  // Sequential and unhurried: this is background work and must not compete with
  // whatever the staff member is actually doing.
  for (const url of unique) {
    try {
      if (await caches.match(url, { ignoreVary: true, cacheName: IMAGE_CACHE })) continue;
      // A dead URL still gets cached by the worker as an opaque response. If it
      // won't decode, take it back out rather than keeping a permanent blank.
      if (await load(url)) warmed++;
      else await forgetCachedImage(url);
      await new Promise(r => setTimeout(r, 60));
    } catch { /* one missing photo doesn't matter */ }
  }
  return warmed;
}

/**
 * Replay anything queued while offline as soon as the connection is back, and
 * again whenever the app is brought to the foreground — phones suspend tabs, so
 * an 'online' event alone misses plenty of reconnections.
 */
export function watchConnectivity() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => { syncQuotes().catch(() => {}); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.onLine) {
      flushOutbox().catch(() => {});
    }
  });
}
