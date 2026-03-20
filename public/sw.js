self.addEventListener('install', () => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // 1. Clear all named caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => {
      // 2. Take control of all open pages immediately
      return self.clients.claim();
    }).then(() => {
      // 3. Unregister this service worker from the browser
      return self.registration.unregister();
    })
  );
});

self.addEventListener('fetch', (event) => {
  
});
