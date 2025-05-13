
self.addEventListener('install', (event) => {
  console.log('JRK ENTERPRISES Service Worker: Installing...');
  // Pre-cache essential assets if needed, for now, just skip waiting.
  // event.waitUntil(
  //   caches.open('jrk-app-cache-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       // Add other critical assets here, e.g., offline page, core CSS/JS
  //     ]);
  //   })
  // );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('JRK ENTERPRISES Service Worker: Activating...');
  // Clean up old caches
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== 'jrk-app-cache-v1') { // Ensure 'jrk-app-cache-v1' matches the cache name used in 'install'
  //           console.log('JRK ENTERPRISES Service Worker: Deleting old cache', cacheName);
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   }).then(() => self.clients.claim()) // Claim clients after cache cleanup
  // );
  event.waitUntil(self.clients.claim()); // Claim clients immediately if no cache cleanup is needed on activation
});

self.addEventListener('fetch', (event) => {
  // This basic fetch handler is often enough for PWA installability checks.
  // It doesn't actually cache anything by default to avoid complexities.
  // For true offline capabilities, a more sophisticated caching strategy (e.g., cache-first, network-first) is needed.
  // console.log('JRK ENTERPRISES Service Worker: Fetching ', event.request.url);

  // Example: Network first, then cache fallback
  // event.respondWith(
  //   fetch(event.request).catch(() => {
  //     return caches.match(event.request).then((response) => {
  //       if (response) {
  //         return response;
  //       }
  //       // Optionally, return a generic offline page if the request is for a navigation
  //       // if (event.request.mode === 'navigate') {
  //       //   return caches.match('/offline.html');
  //       // }
  //     });
  //   })
  // );

  // For now, just pass through to the network.
   event.respondWith(fetch(event.request));
});
