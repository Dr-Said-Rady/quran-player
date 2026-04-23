const CACHE_NAME = 'quran-v5';

// عدم تخزين أي شيء تلقائياً عند التثبيت
self.addEventListener('install', event => {
  console.log('[SW] installing...');
  self.skipWaiting();
});

// استراتيجية Network First - الأهم
self.addEventListener('fetch', event => {
  // للملفات الصوتية: شبكة فقط
  if (event.request.url.includes('.mp3')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // لباقي الملفات: جلب من الشبكة أولاً
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // تخزين نسخة في الكاش للاستخدام offline
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => {
        // في حال عدم وجود اتصال: جلب من الكاش
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] activating...');
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  event.waitUntil(clients.claim());
});
