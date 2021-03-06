var CACHE_NAME = 'app-personium-blog';

function getCacheList() {
  if (window.origin === 'https://yoh1496.github.io') {
    return ['/index.html', '/main.bundle.js'];
  } else {
    return ['/__/front/app', '/__/public/main.bundle.js'];
  }
}
var urlsToCache = getCacheList();

// install 処理
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response ? response : fetch(event.request);
    })
  );
});
