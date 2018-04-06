const version = 'v1';
const staticCachName = 'restaurant-local'+version;
const contentImgsCache = 'restaurant-imgs-'+version;
const contentCache = 'restaurant-web-'+version;

/**
* Install Service Worker.
 */
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

/**
* fetch events.
 */
self.addEventListener('fetch', function(event){
    const requestUrl = new URL(event.request.url);
    if(requestUrl.origin === location.origin){
        if(requestUrl.pathname.startsWith('/img/')){
            event.respondWith(servePhoto(event.request));
            return;
        }
    }
    if (event.request.url.indexOf('https://') == 0) {
        event.respondWith(
            serveContent(event.request)
        );
    } else {
        event.respondWith(
            serveSide(event.request)
        );
    }
});

/**
* handle restaurant-imgs cache.
 */
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

/**
* handle restaurant-web cache.
 */
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

/**
* handle restaurant-local cache.
 */
function serveSide(request) {
    var storageUrl = request.url;
    if(request.url.indexOf('?') != -1){
        storageUrl = storageUrl.slice(0, request.url.indexOf('?'));
    }
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