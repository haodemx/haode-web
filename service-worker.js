const CACHE_VERSION = "haode-pwa-v2026-07-25-ui-phase30";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/app/",
  "/app/index.html",
  "/offline.html",
  "/style.css?v=20260725-ui-phase30",
  "/script.js",
  "/campaign-attribution.js",
  "/products.js?v=20260725-ui-phase28",
  "/detail-header.js?v=20260725-ui-phase30",
  "/site-footer.js?v=20260725-ui-phase30",
  "/app/app.css?v=20260725-ui-phase27",
  "/app/app.js?v=20260725-ui-phase27",
  "/app/products.json",
  "/app/firebase-config.js",
  "/manifest.webmanifest",
  "/assets/logo/logo.png",
  "/assets/logo/favicon.png",
  "/assets/icons/haode-icon-192.png",
  "/assets/icons/haode-icon-512.png",
  "/assets/icons/apple-touch-icon.png",
  "/assets/icons/favicon.png"
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
    || url.pathname.endsWith("/products.generated.js")
    || url.pathname.includes("/data/marketing/daily-ad-");
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
    return cached || cache.match("/offline.html");
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
