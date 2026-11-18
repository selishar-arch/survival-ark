// Ark Offline service worker. Precaches the whole app shell so it runs in airplane mode.
const VERSION = "4d93fd85d8";
const SHELL = "ark-shell-" + VERSION;
const RUNTIME = "ark-runtime-v1";
const PRECACHE = ["./","./assets/chunk-4MLOL24G.js","./assets/chunk-55SFQUHX.js","./assets/chunk-6ZIHKPCM.js","./assets/chunk-I7ET6RIY.js","./assets/chunk-NEPRUQMU.js","./assets/chunk-O2WC6YSU.js","./assets/llm-worker.js","./assets/main.css","./assets/main.js","./assets/maplibre-gl-worker.mjs","./assets/maplibre-gl.css","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512-maskable.png","./icons/icon-512.png","./index.html","./manifest.webmanifest","./maps/fonts/Noto%20Sans%20Italic/0-255.pbf","./maps/fonts/Noto%20Sans%20Italic/256-511.pbf","./maps/fonts/Noto%20Sans%20Italic/8192-8447.pbf","./maps/fonts/Noto%20Sans%20Medium/0-255.pbf","./maps/fonts/Noto%20Sans%20Medium/256-511.pbf","./maps/fonts/Noto%20Sans%20Medium/8192-8447.pbf","./maps/fonts/Noto%20Sans%20Regular/0-255.pbf","./maps/fonts/Noto%20Sans%20Regular/256-511.pbf","./maps/fonts/Noto%20Sans%20Regular/8192-8447.pbf","./maps/sprites/dark.json","./maps/sprites/dark.png","./maps/sprites/dark%402x.json","./maps/sprites/dark%402x.png"];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(PRECACHE.map(u => new Request(u, { cache: "reload" })));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("ark-shell-") && k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // AI model files etc. are cached by WebLLM itself
  if (url.pathname.endsWith(".pmtiles")) return;         // map regions are stored by the app (Cache Storage), range requests pass through
  e.respondWith((async () => {
    if (req.mode === "navigate") {
      const hit = await caches.match(new URL("./index.html", self.registration.scope).href);
      try { const net = await fetch(req); if (net.ok) return net; } catch {}
      return hit || Response.error();
    }
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const net = await fetch(req);
      if (net.ok && net.type === "basic") (await caches.open(RUNTIME)).put(req, net.clone());
      return net;
    } catch (err) {
      if (url.pathname.includes("/maps/fonts/")) return new Response(new ArrayBuffer(0), { headers: { "content-type": "application/x-protobuf" } });
      throw err;
    }
  })());
});
