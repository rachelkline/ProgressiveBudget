const FILES_TO_CACHE = [
    //grab all of the files in public
    "/",
    "/index.html",
    "/style.css",
    "/index.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/db.js"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

//Install service worker
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("SUCCESS: Files pre-cached");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

//Acticate service worker, remove old data
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList =>
            Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("SUCCESS: Removing cache data", key);
                        return caches.delete(key);
                    }
                })
            ))
    );
    self.clients.claim();
});

//Service worker to intercept requests from network
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api")) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache =>
                    fetch(ect.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err =>
                            cache.match(evt.request)
                        )
                ).catch(err => console.log(err))
        );
        return;
    }
    // Shows files from the cache when offline
    evt.respondWith(
        caches
            .open(CACHE_NAME)
            .then(cache =>
                cache
                    .match(evt.request)
                    .then(response => response || fetch(evt.request))
            )
    );
});