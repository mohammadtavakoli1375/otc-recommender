/* global self, caches, clients */
self.skipWaiting();

const VERSION = "v2025-08-29-01"; // هر دیپلوی افزایش بده
const STATIC_CACHE = `static-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll([
      "/",            // optional
      "/offline.html" // اختیاری: اگر داری
    ]);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // Clean up old caches
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => !k.includes(VERSION)).map(k => caches.delete(k)));
    
    // Claim clients only when this worker becomes active
    await self.clients.claim();
    console.log('Service Worker activated and claimed clients');
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Navigation requests → network-first
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        return fresh;
      } catch {
        const cache = await caches.open(STATIC_CACHE);
        const offline = await cache.match("/offline.html");
        return offline || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }
  // سایر درخواست‌ها: cache-first با fallback به شبکه (دلخواه)
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const fresh = await fetch(request);
      return fresh;
    } catch {
      return cached || new Response("Network error", { status: 408 });
    }
  })());
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline form submissions
      console.log('Background sync triggered')
    );
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'مشاهده',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'بستن',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('مشاور OTC', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});