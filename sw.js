self.__PRECACHE__ = ["assets/html2canvas.esm-CBrSDip1.js","assets/index-65MTiwUu.css","assets/index-DMYNULh8.js","assets/index.es-2Zp7Hugo.js","assets/purify.es-BaNf_EpD.js","favicon.svg","icon-maskable.svg","icons.svg","manifest.webmanifest"];
self.__BUILD_ID__ = "f75ece3d";
/* Comforto service worker — offline-first app shell.
 *
 * Strategy per request type:
 *   navigations   network-first, falling back to the cached shell, so the app
 *                 opens with no connection at all
 *   app assets    precached at install (list injected at build time, see the
 *                 comforto-precache plugin in vite.config.js) then cache-first.
 *                 Precaching is what makes the app survive the site being down
 *                 — lazily-cached assets would only cover pages already visited.
 *   images        cache-first, including cross-origin product photos, which are
 *                 opaque responses and so have to be accepted without a status
 *   /api/*        network-only — quotes and the catalog are reconciled by the
 *                 app itself through IndexedDB, and a stale cached API response
 *                 would be worse than a clean failure
 *
 * Scope is derived from where this file is served, so it works under both
 * "/" (Vercel) and "/comforto/" (GitHub Pages) without a build step.
 */

// Replaced during the build. `__BUILD_ID__` changes whenever the assets do, which
// is what retires the previous caches.
const PRECACHE = self.__PRECACHE__ || [];
const BUILD_ID = self.__BUILD_ID__ || 'dev';

const SHELL_CACHE = `comforto-shell-${BUILD_ID}`;
const ASSET_CACHE = `comforto-assets-${BUILD_ID}`;
const IMAGE_CACHE = 'comforto-images';        // survives deploys; images are content-addressed by URL
const KEEP = new Set([SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE]);

const MAX_IMAGES = 400;

// How long a navigation waits for the network before the cached shell is used.
const NAV_TIMEOUT = 3500;

const BASE = new URL('./', self.location).pathname;   // '/' or '/comforto/'
const SHELL_URL = BASE;                               // index.html for this scope

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    // Individually, so one missing file can't fail the whole install.
    await Promise.all([
      shell.add(new Request(SHELL_URL, { cache: 'reload' })).catch(() => {}),
      ...PRECACHE.map(path =>
        shell.add(new Request(BASE + path, { cache: 'reload' })).catch(() => {})
      ),
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => !KEEP.has(n)).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Keep the image cache from growing without bound — oldest entries go first.
const trimImages = async () => {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  if (keys.length <= MAX_IMAGES) return;
  await Promise.all(keys.slice(0, keys.length - MAX_IMAGES).map(k => cache.delete(k)));
};

// Offline, a request to an unreachable host can stay pending for a long time
// rather than failing — which leaves images spinning forever instead of showing
// their placeholder. Give the network a bounded chance, then give up.
const fetchWithTimeout = (request, ms) =>
  ms ? Promise.race([
    fetch(request),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]) : fetch(request);

const cacheFirst = (request, cacheName, { allowOpaque = false, ignoreVary = false, timeout = 0 } = {}) =>
  // ignoreVary matters for the image CDN: it answers with `Vary: Accept`, so a
  // strict match misses entries this very worker stored moments earlier.
  caches.match(request, { ignoreVary }).then(hit => {
    if (hit) return hit;
    return fetchWithTimeout(request, timeout).then(response => {
      const storable = response && (response.ok || (allowOpaque && response.type === 'opaque'));
      if (storable) {
        const copy = response.clone();
        caches.open(cacheName)
          .then(c => c.put(request, copy))
          .then(() => { if (cacheName === IMAGE_CACHE) return trimImages(); })
          .catch(() => {});
      }
      return response;
    });
  });

const isAppAsset = (url) =>
  /\.(?:js|css|woff2?|ttf|otf|webmanifest)$/i.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && url.pathname.startsWith('/api/')) return;   // never cache the API

  // Product photos live on an external host, so images are handled before the
  // same-origin check. Opaque responses are cached deliberately: without that,
  // the catalog is pictureless the moment the site is unreachable.
  if (request.destination === 'image') {
    event.respondWith(
      cacheFirst(request, IMAGE_CACHE, { allowOpaque: true, ignoreVary: true, timeout: 6000 })
        .catch(() => caches.match(request, { ignoreVary: true }).then(hit => hit || Response.error()))
    );
    return;
  }

  if (!sameOrigin) return;

  // Navigations: try the network so a new deploy is picked up, fall back to the
  // cached shell when there's nothing to talk to.
  //
  // The network gets a short deadline rather than an open-ended wait. A refused
  // connection fails immediately, but a server that is merely unreachable — a
  // captive portal, a dropping mobile signal, DNS hanging — can leave the
  // request pending for half a minute, during which the app appears dead even
  // though a perfectly good copy is sitting in the cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(request, NAV_TIMEOUT)
        .then(response => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then(c => c.put(SHELL_URL, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(SHELL_URL, { ignoreSearch: true, ignoreVary: true })
          .then(hit => hit || new Response(
            '<h1>Offline</h1><p>Open the app once while connected, then it will work offline.</p>',
            { headers: { 'Content-Type': 'text/html' }, status: 503 }
          )))
    );
    return;
  }

  // ignoreVary again: assets are precached with a plain Request, but the page
  // asks for them as CORS module scripts, and a strict Vary comparison rejects
  // the very entry the install step just stored. Fingerprinted filenames mean
  // one URL is always exactly one file, so Vary has nothing useful to say.
  if (isAppAsset(url)) event.respondWith(cacheFirst(request, ASSET_CACHE, { ignoreVary: true }));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
