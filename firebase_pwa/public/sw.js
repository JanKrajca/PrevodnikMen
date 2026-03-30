const CACHE_NAME = 'currency-converter-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/historie.html',
  '/nastaveni.html',
  '/Style/style.css',
  '/JavaScript/config.js',
  '/JavaScript/utils.js',
  '/JavaScript/api.js',
  '/JavaScript/storage.js',
  '/JavaScript/ui.js',
  '/JavaScript/converter.js',
  '/JavaScript/history.js',
  '/JavaScript/settings.js',
  '/JavaScript/main.js',
  '/manifest.json'
];

// Instalace - cachujeme všechny soubory aplikace
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivace - smažeme staré cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - nejdřív síť, při chybě cache (offline fungování)
self.addEventListener('fetch', event => {
  // API požadavky - pouze síť, při chybě nic neděláme (app má vlastní fallback)
  if (event.request.url.includes('exchangerate-api.com')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Ostatní - nejdřív cache, pak síť
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Uložíme do cache pro příště
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => caches.match('/index.html'))
  );
});
