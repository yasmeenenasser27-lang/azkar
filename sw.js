// اسم الكاش - غيّري الرقم عند كل تحديث للموقع عشان تنزل النسخة الجديدة
const CACHE_NAME = "azkar-v4";
const RUNTIME_CACHE = "azkar-runtime-v4";
const ASSET_CACHE = "azkar-assets-v4";

// الملفات الأساسية للموقع (الهيكل) - يتم تخزينها فوراً عند أول زيارة
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./design.png",
];

// الخطوط والمكتبات الخارجية
const EXTERNAL_ASSETS = [
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2",
];

// التثبيت: تخزين ملفات الموقع الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(ASSET_CACHE).then((cache) => cache.addAll(EXTERNAL_ASSETS)),
    ]),
  );
  self.skipWaiting();
});

// التفعيل: حذف أي كاش قديم من نسخة سابقة
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter(
            (key) =>
              key !== CACHE_NAME &&
              key !== RUNTIME_CACHE &&
              key !== ASSET_CACHE,
          )
          .map((key) => {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          }),
      ),
    ),
  );
  self.clients.claim();
});

// جلب الملفات: استراتيجية ذكية للـ offline
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // تجاهل أي طلب مش GET (زي POST)
  if (req.method !== "GET") return;

  // الملفات المحلية: أولوية للكاش
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(req)
          .then((networkResponse) => {
            // خزن النسخة الناجحة
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              req.method === "GET"
            ) {
              const responseClone = networkResponse.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(req, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // عند فشل جلب الملف، حاول من الكاش
            return caches.match(req).then((cachedRes) => {
              if (cachedRes) {
                return cachedRes;
              }
              // إذا كان طلب navigate (صفحة)، اعرض الصفحة الرئيسية
              if (req.mode === "navigate") {
                return caches.match("./index.html");
              }
            });
          });
      }),
    );
  } else {
    // الملفات الخارجية (CDN، صور، إلخ): استراتيجية stale-while-revalidate
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        // إعادة المخزن مع محاولة التحديث في الخلفية
        const fetchPromise = fetch(req).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(ASSET_CACHE).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      }),
    );
  }
});
