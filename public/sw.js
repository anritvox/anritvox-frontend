// Self-unregistering service worker - clears all caches and unregisters
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((name) => caches.delete(name)));
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    })
  );
});

// Pass through all requests without caching
self.addEventListener('fetch', (event) => {
  // Do nothing - let requests go through normally
});
