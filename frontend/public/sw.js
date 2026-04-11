const CACHE_NAME = "verp-cache-v4";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/site.jpg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

/* ── Skip requests that should never be cached ── */
const shouldSkip = (url) =>
  !url.startsWith("http") ||
  url.includes("/@vite/") ||
  url.includes("/@react-refresh") ||
  url.includes("/src/") ||
  url.includes("/__vite") ||
  url.includes("/api/") ||           // never cache API calls
  url.includes("supabase.co");       // never cache Supabase calls

/* ══════════════════════════════════════
   INSTALL — pre-cache shell assets
   ══════════════════════════════════════ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn(`[SW] Failed to pre-cache ${url}:`, err)
          )
        )
      )
    )
  );
  // Activate immediately — don't wait for old tabs to close
  self.skipWaiting();
});

/* ══════════════════════════════════════
   ACTIVATE — wipe every old cache
   ══════════════════════════════════════ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => {
            console.log(`[SW] Deleting old cache: ${k}`);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim()) // take control of all open tabs immediately
  );
});

/* ══════════════════════════════════════
   FETCH — network first, cache fallback
   ══════════════════════════════════════ */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = event.request.url;

  if (shouldSkip(url)) return;

  const isNavigation = event.request.mode === "navigate";

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid responses — skip opaque/error responses
        if (response && response.status === 200 && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Network failed — try cache
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // For page navigations (someone opening a URL directly or refreshing),
        // serve index.html so React Router can handle routing offline
        if (isNavigation) {
          const shell = await caches.match("/index.html");
          if (shell) return shell;
        }

        // Nothing in cache — return a clean 503 instead of undefined
        return new Response(
          JSON.stringify({ error: "You appear to be offline." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
  );
});

/* ══════════════════════════════════════
   MESSAGE — force update from app code
   Trigger with: navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
   ══════════════════════════════════════ */
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});