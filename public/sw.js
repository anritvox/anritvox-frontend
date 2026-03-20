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
      // Unregister this service worker completely to avoid No-op warnings
      return self.registration.unregister();
    })
  );
});
// Ensure there is NO self.addEventListener('fetch', ...) below this line!
