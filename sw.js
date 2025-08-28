const CACHE_NAME = 'wdos-pwa-v1';
const ASSETS = [
  'index.html',
  'styles.css',
  'app.js',
  'offline.html',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - For navigations (pages), try network first, then offline.html fallback.
// - For static files, use cache-first.
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Page navigations
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('offline.html'))
    );
    return;
  }

  // Static assets
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});