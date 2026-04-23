// Service Worker معطل تماماً لمنع المشاكل
self.addEventListener('install', () => {
    console.log('SW installed but disabled');
    self.skipWaiting();
});

self.addEventListener('fetch', () => {
    // لا نقوم بتخزين أي شيء، فقط نمرر الطلب للشبكة
    return;
});

self.addEventListener('activate', () => {
    console.log('SW activated but disabled');
});
