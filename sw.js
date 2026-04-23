const CACHE_NAME = 'quran-v2';
const BASE_PATH = '/dr-said-rady-quran'; // 👈 تأكد أن هذا هو اسم المستودع الخاص بك بالضبط

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/player.html`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`,
  `${BASE_PATH}/manifest.json`
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache error:', err);
        // حتى لو فشل التخزين المؤقت، نكمل التثبيت
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدنا الملف في الكاش، نرجعه
        if (response) {
          return response;
        }
        
        // محاولة جلب الملف من الشبكة
        let fetchRequest = event.request;
        
        // إذا كان الطلب يشمل BASE_PATH، نحاول إزالته
        let url = event.request.url;
        if (url.includes(BASE_PATH)) {
          let newUrl = url.replace(BASE_PATH, '');
          fetchRequest = new Request(newUrl, {
            method: event.request.method,
            headers: event.request.headers,
            mode: 'cors',
            credentials: 'omit'
          });
        }
        
        return fetch(fetchRequest)
          .then(fetchResponse => {
            // نسخ الاستجابة لتخزينها في الكاش
            let responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return fetchResponse;
          })
          .catch(() => {
            // إذا فشل الجلب، نحاول إرجاع index.html كصفحة احتياطية
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
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});
