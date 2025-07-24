const CACHE_NAME = 'lifexp-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-256x256.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
  // Přidejte další assety dle potřeby
];

// Install event: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(urlsToCache).catch(err => {
        // Pokud některý asset chybí, logni chybu, ale neblokuj instalaci
        console.error('SW cache addAll error:', err);
      })
    )
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event: try cache first, then network, fallback to offline if needed
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      if (response) return response;
      return fetch(event.request)
        .then(networkResponse => {
          // Optionally cache new requests here if you want dynamic caching
          return networkResponse;
        })
        .catch(() => {
          // Optionally return a fallback page/image here
          // Example: if (event.request.destination === 'document') return caches.match('/offline.html');
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
    })
  );
});