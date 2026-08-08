// اسم الكاش - غيّري الرقم عند كل تحديث للموقع عشان تنزل النسخة الجديدة
const CACHE_NAME = "azkar-v1";
const RUNTIME_CACHE = "azkar-v1";

// الملفات الأساسية للموقع (الهيكل) - يتم تخزينها فوراً عند أول زيارة
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./azkar.png",
  "./azkar.png",
];

// التثبيت: تخزين ملفات الموقع الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

// التفعيل: حذف أي كاش قديم من نسخة سابقة
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

// جلب الملفات: أولوية للكاش (يشتغل من غير نت)، ولو الملف مش موجود يحاول ينزله من النت ويخزنه لاستخدام لاحق
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // تجاهل أي طلب مش GET (زي POST)
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(req)
        .then((networkResponse) => {
          // نخزن نسخة من أي ملف ينجح تحميله (خطوط، أيقونات، الصفحة الرئيسية، إلخ)
          // عشان المرة الجاية يفتح من غير نت
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" ||
              networkResponse.type === "cors" ||
              networkResponse.type === "opaque")
          ) {
            const responseClone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // لو مفيش نت ومفيش نسخة مخزنة (زي أول مرة يفتح فيها صفحة معينة)
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    }),
  );
});
