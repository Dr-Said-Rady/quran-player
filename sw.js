const CACHE_NAME = 'quran-v2';
const BASE_PATH = '/dr-said-rady-quran'; // 👈 أضف مسار المستودع الخاص بك

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/player.html`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/manifest.json`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache error:', err))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        // محاولة إزالة BASE_PATH من الطلب إذا فشل
        let fetchRequest = event.request;
        if (event.request.url.includes(BASE_PATH)) {
          fetchRequest = new Request(
            event.request.url.replace(BASE_PATH, ''),
            { method: event.request.method, headers: event.request.headers }
          );
        }
        return fetch(fetchRequest).catch(() => {
          // إذا فشل الجلب، حاول إرجاع صفحة index.html
          return caches.match(`${BASE_PATH}/index.html`);
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});
