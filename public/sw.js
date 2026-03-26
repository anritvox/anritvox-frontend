// Anritvox Service Worker - PWA Install + Caching
const CACHE_NAME = 'anritvox-v2';
const STATIC_CACHE = 'anritvox-static-v2';
const API_ORIGIN = 'https://service.anritvox.com';

// Assets to pre-cache (static shell only)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.webp',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
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
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // CRITICAL: Never intercept cross-origin API requests.
  // Let the browser handle them natively with proper CORS headers.
  // Intercepting cross-origin fetches in a SW causes CORS failures
  // because the SW cannot forward credentials/CORS headers correctly.
  if (url.origin !== self.location.origin) {
    return; // Do NOT call event.respondWith() - browser handles it natively
  }

  // For navigation requests (SPA), serve index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Cache-first for same-origin static assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
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
