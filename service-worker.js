const CACHE_NAME = 'storia-2026-pwa-v103';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app-version.json',
  './icons/icon-32.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.clients.matchAll({type:'window',includeUncontrolled:true}))
      .then(clients => clients.forEach(client => client.postMessage({type:'UPDATE_READY',version:'2026.06.29.1700'})))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).pathname.endsWith('/app-version.json')) {
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(() => caches.match(event.request)));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200 && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
