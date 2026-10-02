/* La Cocina de Nene: funciona sin conexión.
   La página se pide siempre a la red; si no hay red (o tarda más de 4 s), se sirve la última copia guardada. */
const CACHE = 'cocina-v1';
const SHELL = ['./', 'apple-touch-icon.png', 'icon-192.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function wait(ms){ return new Promise(r => setTimeout(() => r(null), ms)); }

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (url.pathname.endsWith('version.json')) return;            // siempre de la red

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const fresh = fetch(url.pathname, {cache: 'no-cache'})
        .then(res => { if (res && res.ok) cache.put('./', res.clone()); return res; })
        .catch(() => null);
      const first = await Promise.race([fresh, wait(4000)]);
      if (first && first.ok) return first;
      const saved = await cache.match('./');
      if (saved) return saved;
      return (await fresh) || Response.error();
    })());
    return;
  }

  const fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== self.location.origin && !fonts) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req);
    if (hit) {
      if (!fonts) fetch(req).then(r => { if (r && r.ok) cache.put(req, r); }).catch(() => {});
      return hit;
    }
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  })());
});
