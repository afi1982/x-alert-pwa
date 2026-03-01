const CACHE = 'x-alert-v4';
const SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first, cache fallback
self.addEventListener('fetch', e => {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push notification received from server (future use)
self.addEventListener('push', e => {
  let d = { title: '🚨 X Alert', body: 'נמצא תוכן חדש!', url: '/' };
  if (e.data) { try { d = e.data.json(); } catch { d.body = e.data.text(); } }
  e.waitUntil(showNotif(d.title, d.body, d.url));
});

// Message from app → show notification
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    showNotif(e.data.title, e.data.body, e.data.url || '/');
  }
});

function showNotif(title, body, url) {
  return self.registration.showNotification(title, {
    body,
    icon:  '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'xa-' + Date.now(),
    requireInteraction: true,
    actions: [
      { action: 'open',    title: 'פתח' },
      { action: 'dismiss', title: 'סגור' }
    ],
    data: { url }
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) { c.focus(); return; }
      }
      return clients.openWindow(url);
    })
  );
});
