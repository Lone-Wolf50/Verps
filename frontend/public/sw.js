const CACHE_NAME = "verp-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/site.jpg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn(`Failed to cache ${url}:`, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  // Skip non-http requests (chrome-extension etc)
  if (!url.startsWith("http")) return;

  // Skip Vite internal requests during development
  if (
    url.includes("/@vite/") ||
    url.includes("/@react-refresh") ||
    url.includes("/src/") ||
    url.includes("/__vite")
  ) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Return a proper 404 instead of undefined
          return new Response("Not found", { status: 404 });
        })
      )
  );
});