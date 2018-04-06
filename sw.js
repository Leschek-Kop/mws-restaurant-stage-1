const version = 'v1';
const staticCachName = 'restaurant-'+version;
const contentImgsCache = 'restaurant-imgs-'+version;
const contentCache = 'restaurant-content-'+version;
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

// TODO: New URL to cache!!!

self.addEventListener('fetch', function(event){
    const requestUrl = new URL(event.request.url);
    if(requestUrl.origin === location.origin){
        if(requestUrl.pathname.startsWith('/img/')){
            event.respondWith(servePhoto(event.request));
            return;
        }
    }
    console.log('indexOf:' , event.request.url.indexOf('https://'));
    if (event.request.url.indexOf('https://') == 0) {
        console.log('Google: ', event.request.url);
        event.respondWith(
            // Handle Maps API requests in a generic fashion,
            // by returning a Promise that resolves to a Response.
            serveContent(event.request)
        );
    } else {
        console.log('Local: ', event.request.url);
        event.respondWith(
            serveSide(event.request)
        );
    }
});

function servePhoto(request) {
    const imgKey = '/img/';
    const posImg = request.url.indexOf(imgKey);
    const storageUrl = request.url.slice(0, posImg + imgKey.length + 1);
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

function serveContent(request) {
    const storageUrl = request.url;
    return caches.open(contentCache).then(function(cache){
        return cache.match(storageUrl).then(function(response){
            if (response) return response;

            return fetch(request).then(function(networkResponse){
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}

function serveSide(request) {
    const storageUrl = request.url;
    return caches.open(staticCachName).then(function(cache){
        return cache.match(storageUrl).then(function(response){
            if (response) return response;

            return fetch(request).then(function(networkResponse){
                cache.put(storageUrl, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}