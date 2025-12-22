// Service Worker for Roadtrip Puzzel App
// Enables offline functionality

const CACHE_NAME = 'roadtrip-puzzel-v3.0.0';

// Files to cache for offline use
const CACHE_FILES = [
    './',
    './index.html',
    './remote.html',
    './manifest.json',
    './src/css/style.css',
    './src/css/tablet.css',
    './src/js/storage.js',
    './src/js/audio.js',
    './src/js/puzzle.js',
    './src/js/timer.js',
    './src/js/tasks.js',
    './src/js/remote.js',
    './src/js/app.js',
    './src/js/tablet-app.js',
    './src/js/memory-game.js',
    './src/js/drawing-game.js',
    './src/js/game-manager.js',
    './src/assets/images/icon-192.svg',
    './src/assets/images/icon-512.svg'
];

// Install event - cache all required files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(CACHE_FILES);
            })
            .then(() => {
                console.log('Service Worker: All files cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Now active');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Network failed, try to return a fallback
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return null;
                    });
            })
    );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
