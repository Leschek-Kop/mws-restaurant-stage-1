const staticCachName = 'restaurant-v1';
const contentImgsCache = 'restaurant-imgs';
const allCaches = [
    staticCachName,
    contentImgsCache
];

self.addEventListener('install', function(event){
    const urlToCache = [
        '/',
        'sw.js',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'css/styles.css',
        'data/restaurants.json'
    ];
    event.waitUntil(
        caches.open(staticCachName).then(function(cache){
            return cache.addAll(urlToCache);
        })
    );
});

self.addEventListener('fetch', function(event){
    const requestUrl = new URL(event.request.url);
    if(requestUrl.origin === location.origin){
        if(requestUrl.pathname.startsWith('/img/')){
            event.respondWith(servePhoto(event.request));
            return;
        }
    }

    event.respondWith(
        caches.match(event.request).then(function(response){
            return response || fetch(event.request);
        })
    );    
});

function servePhoto(request) {
    const imgKey = '/img/';
    const posImg = request.url.indexOf(imgKey);
    var storageUrl = request.url.slice(0, posImg + imgKey.length + 1);
    console.log(storageUrl);

    return caches.open(contentImgsCache).then(function(cache){
        return cache.match(storageUrl).then(function(response){
            if (response) return response;

            return fetch(request).then(function(networkResponse){
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}