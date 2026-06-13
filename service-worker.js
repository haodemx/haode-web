const CACHE_VERSION = "haode-pwa-v2026-06-13-offers-single-01";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_URLS = [
  "/haode-web/",
  "/haode-web/index.html",
  "/haode-web/app/",
  "/haode-web/app/index.html",
  "/haode-web/offline.html",
  "/haode-web/style.css",
  "/haode-web/script.js",
  "/haode-web/products.js",
  "/haode-web/app/app.css",
  "/haode-web/app/app.js",
  "/haode-web/app/promo-junio-prices.json",
  "/haode-web/app/firebase-config.js",
  "/haode-web/manifest.webmanifest",
  "/haode-web/assets/logo/logo.png",
  "/haode-web/assets/logo/favicon.png",
  "/haode-web/assets/icons/haode-icon-192.png",
  "/haode-web/assets/icons/haode-icon-512.png",
  "/haode-web/assets/icons/apple-touch-icon.png",
  "/haode-web/assets/icons/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("haode-pwa-") && !cacheName.startsWith(CACHE_VERSION))
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

function isHtmlRequest(request) {
  return request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");
}

function isFreshDataRequest(url) {
  return url.pathname.endsWith("/products.json")
    || url.pathname.endsWith("/promo-junio-prices.json")
    || url.pathname.endsWith("/products.generated.js");
}

async function networkFirst(request) {
  const cache = await caches.open(APP_SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached || cache.match("/haode-web/offline.html");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (isFreshDataRequest(url) || isHtmlRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
