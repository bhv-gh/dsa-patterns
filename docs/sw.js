/* Service worker — precache app shell + all module data for full offline use. */
const CACHE = 'dsa-patterns-v12';

const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './modules/index.json',
  './anim/_framework.js',
];

// module data files 1..67
const MODULES = Array.from({ length: 67 }, (_, i) => `./modules/${i + 1}.json`);

// per-module animation scripts (slug-based)
const ANIM = [
  'two-pointers-overview', 'container-with-most-water', 'two-sum-sorted', '3-sum',
  'valid-triangle-number', 'move-zeroes', 'sort-colors', 'trapping-rain-water',
  'fixed-length-sliding-window', 'max-sum-subarrays-size-k', 'max-points-from-cards',
  'max-sum-distinct-subarrays-k', 'variable-length-sliding-window',
  'longest-substring-no-repeat', 'longest-repeating-char-replacement',
  // intervals
  'intervals-overview', 'can-attend-meetings', 'insert-interval',
  'non-overlapping-intervals', 'merge-intervals', 'employee-free-time',
  // stack
  'stack-overview', 'valid-parentheses', 'decode-string', 'longest-valid-parentheses',
  'monotonic-stack', 'daily-temperatures', 'largest-rectangle-in-histogram',
  // linked list
  'linked-list-overview', 'linked-list-cycle', 'palindrome-linked-list',
  'remove-nth-node-from-end', 'reorder-list', 'swap-nodes-in-pairs',
  // binary search
  'binary-search-overview', 'koko-eating-bananas', 'search-in-rotated-sorted-array',
  'split-array-largest-sum', 'minimum-shipping-capacity',
].map((slug) => `./anim/${slug}.js`);

const PRECACHE = SHELL.concat(MODULES, ANIM);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Cache-first for same-origin assets; fall back to network, then update cache.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // Revalidate in the background (stale-while-revalidate) for JSON/shell.
        fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // offline & uncached: for navigations, serve the app shell
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
