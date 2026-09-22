// Service Worker — Portal Presales SEIDOR México
// Regla de oro: SOLO se cachean assets estáticos (imágenes, íconos, CSS, JS, plantillas).
// Nunca se cachea /api/* ni ninguna respuesta que contenga datos del negocio.

const CACHE_NAME = 'seidor-presalesmx-v1';

const PRECACHE_ASSETS = [
  '/manifest.json',
  '/styles.css',
  '/script.js',
  '/assets/logo_dark.png',
  '/assets/logo_light.png',
  '/assets/bg_dark.png',
  '/assets/bg_light.png',
  '/assets/bg_cover.png',
  '/assets/bg_close.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/apple-touch-icon.png',
];

const STATIC_EXTENSIONS = /\.(png|jpe?g|svg|gif|webp|css|woff2?|ttf|ico|docx|xlsx)$/i;
// script.js es código de la interfaz (seguro de cachear); data.js trae precios reales del
// negocio y JAMÁS debe cachearse, aunque comparta la extensión .js con el código de interfaz.
const CODE_JS_FILES = ['/script.js'];
const NUNCA_CACHEAR = ['/data.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => { /* si algún asset falla al precachear, no bloquea la instalación */ })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Nunca interceptar llamadas a la API, nada que no sea GET, ni archivos marcados
  // explícitamente como datos del negocio (aunque tengan extensión .js): siempre van
  // a la red, sin caché, para que los datos siempre estén al día.
  if (url.pathname.startsWith('/api/') || req.method !== 'GET' || url.origin !== location.origin || NUNCA_CACHEAR.includes(url.pathname)) {
    return;
  }

  const esAssetEstatico = STATIC_EXTENSIONS.test(url.pathname) || CODE_JS_FILES.includes(url.pathname);

  if (esAssetEstatico) {
    // Cache-first: los assets estáticos casi no cambian, se sirven rápido desde caché
    // y se refrescan en segundo plano.
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Páginas HTML (el "cascarón" de la app): network-first, para ver siempre la versión
  // más reciente del sitio; si no hay internet, se cae a la última copia guardada.
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp && resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return resp;
        })
        .catch(() => caches.match(req))
    );
  }
  // Todo lo demás pasa directo a la red sin interceptar.
});
