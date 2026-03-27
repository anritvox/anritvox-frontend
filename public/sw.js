// Anritvox Service Worker - PWA Install + Caching
const CACHE_NAME = 'anritvox-v3';
const STATIC_CACHE = 'anritvox-static-v3';

// Assets to pre-cache (static shell only)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.webp',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('SW: Pre-cache partial fail:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name)) // Clear all old caches when updating
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never intercept cross-origin API requests.
  if (url.origin !== self.location.origin) {
    return; 
  }

  // NETWORK-FIRST STRATEGY FOR HTML/SPA NAVIGATION
  // This guarantees the user ALWAYS gets your latest Vercel deployment instantly.
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html')) // Fallback to cached version only if offline
    );
    return;
  }

  // CACHE-FIRST STRATEGY FOR STATIC ASSETS (Images, JS, CSS)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Anritvox', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Anritvox', {
      body: data.body || '',
      icon: '/logo.webp',
      badge: '/favicon.ico',
      tag: data.tag || 'anritvox-notification',
      data: data.url ? { url: data.url } : {}
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
