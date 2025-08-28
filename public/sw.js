/* Simple service worker for Tashu PWA */
const CACHE_NAME = 'tashu-cache-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first for JSON/API; Cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isGET = request.method === 'GET';
  if (!isGET) return;

  const isAPI = /\/api\//.test(request.url) || request.headers.get('accept')?.includes('application/json');

  if (isAPI) {
    // Network first
    event.respondWith(
      fetch(request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache first
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
