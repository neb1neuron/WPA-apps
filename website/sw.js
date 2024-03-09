const cacheName = "calculator v2.0.1"; //the name of our cache
const cacheAsset = ["index.html", "style.css", "main.js"]; //this is the asset that we want to cache

self.addEventListener("install", (e) => {
    console.log("service worker installed");

    e.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => {
                console.log("service worker: caching files");
                cache.addAll(cacheAsset);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (e) => {
    console.log("service worker activated");

    //removing unwanted caches
    e.waitUntil(
        caches.keys().then((cacheName) => {
            return Promise.all(
                cacheName.map((cache) => {
                    if (cache !== cacheName) {
                        console.log("Service worker: clear old caches");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener("fetch", (e) => {
    console.log("service worker: fetching");
    //checking if the live site is avaialble and if not, responsd with the cache site
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

self.addEventListener("push", (e) => {
    const data = e.data.json();
    console.log(`push received: ${data}`);

    const notifTitle = `🤖 Botu\'`;
    const options = {
        body: data,
        icon: './images/icons/icon-144x144.png',
        badge: './images/icons/badge.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    self.registration.showNotification(notifTitle, options);
});

self.onnotificationclick = (event) => {
    console.log("On notification click: ", event.notification.tag);
    event.notification.close();

    // This looks to see if the current is already open and
    // focuses if it is
    event.waitUntil(
        clients
            .matchAll({
                type: "window",
            })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url === "/" && "focus" in client) return client.focus();
                }
                if (clients.openWindow) return clients.openWindow("/");
            }),
    );
};