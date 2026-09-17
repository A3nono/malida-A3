// Service Worker للتطبيق
// هذا الملف اختياري ولكن يوصى به لتحسين الأداء والعمل بدون إنترنت

const CACHE_NAME = 'malida-shorw-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: تم البدء في التثبيت');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: تخزين الملفات');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.log('Service Worker: خطأ في التثبيت', error);
      })
  );
});

// تنشيط Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: تم التنشيط');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: حذف الـ Cache القديمة');
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
});

// معالجة الطلبات
self.addEventListener('fetch', (event) => {
  // تجاهل الطلبات غير GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إذا كان الملف في الـ Cache، أرجعه
        if (response) {
          console.log('Service Worker: الملف من Cache');
          return response;
        }

        // وإلا، جلب الملف من الإنترنت
        return fetch(event.request)
          .then((response) => {
            // تحقق من صحة الردود
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // انسخ الرد
            const responseToCache = response.clone();

            // خزّن الملف الجديد
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Service Worker: خطأ في التخزين', error);
              });

            return response;
          })
          .catch((error) => {
            // عند فشل الاتصال، أرجع ملف بديل من Cache
            console.log('Service Worker: لا يوجد إنترنت', error);
            // يمكنك هنا إرجاع صفحة خطأ مخزنة
            return caches.match('./index.html');
          });
      })
  );
});

// رسالة من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: تم التحميل بنجاح');
