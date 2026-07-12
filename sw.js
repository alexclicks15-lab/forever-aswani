/* ====================================================
   Service Worker — Cache-first for static assets
   ==================================================== */

const CACHE_NAME = 'forever-aswani-v13';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'js/main.js',
  'js/scenes.js',
  'js/particles.js',
  'js/starfield.js',
  'js/proposal.js',
  'manifest.json',
  'assets/images/og-preview.png'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {
        // Fail silently if some assets aren't available yet
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for assets, network-first for HTML
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Bypass cache completely for local development to prevent stale caches
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]' || url.hostname === '::1') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network-first for HTML (always get latest)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
