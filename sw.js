// Ark Offline service worker. Precaches the whole app shell so it runs in airplane mode.
const VERSION = "d229800baf";
const SHELL = "ark-shell-" + VERSION;
const RUNTIME = "ark-runtime-v1";
const PRECACHE = ["./","./assets/chunk-4MLOL24G.js","./assets/chunk-55SFQUHX.js","./assets/chunk-6ZIHKPCM.js","./assets/chunk-I7ET6RIY.js","./assets/chunk-NEPRUQMU.js","./assets/chunk-O2WC6YSU.js","./assets/llm-worker.js","./assets/main.css","./assets/main.js","./assets/maplibre-gl-worker.mjs","./assets/maplibre-gl.css","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512-maskable.png","./icons/icon-512.png","./img/photos/acorns.webp","./img/photos/africanized-bee.webp","./img/photos/banded-water-snake.webp","./img/photos/bark-scorpion.webp","./img/photos/black-racer.webp","./img/photos/black-widow.webp","./img/photos/blackberry.webp","./img/photos/brazilian-pepper.webp","./img/photos/brown-recluse.webp","./img/photos/brown-widow.webp","./img/photos/cabbage-palm.webp","./img/photos/castor-bean.webp","./img/photos/cat-comms.webp","./img/photos/cat-disaster.webp","./img/photos/cat-firstaid.webp","./img/photos/cat-fishing.webp","./img/photos/cat-food.webp","./img/photos/cat-hunting.webp","./img/photos/cat-hurricane.webp","./img/photos/cat-knots.webp","./img/photos/cat-navigation.webp","./img/photos/cat-power.webp","./img/photos/cat-rv.webp","./img/photos/cat-shelter.webp","./img/photos/cat-traps.webp","./img/photos/cat-water.webp","./img/photos/cat-wilderness.webp","./img/photos/cattail.webp","./img/photos/copperhead.webp","./img/photos/coral-snake.webp","./img/photos/corn-snake.webp","./img/photos/cottonmouth.webp","./img/photos/dandelion.webp","./img/photos/death-camas.webp","./img/photos/deer-tick.webp","./img/photos/eastern-diamondback.webp","./img/photos/fire-ant.webp","./img/photos/golden-silk.webp","./img/photos/grp-bugs.webp","./img/photos/grp-snakes.webp","./img/photos/grp-spiders.webp","./img/photos/grp-toxic.webp","./img/photos/hognose.webp","./img/photos/jimsonweed.webp","./img/photos/lantana.webp","./img/photos/lone-star-tick.webp","./img/photos/man-o-war.webp","./img/photos/manchineel.webp","./img/photos/mosquito.webp","./img/photos/muscadine.webp","./img/photos/oleander.webp","./img/photos/paper-wasp.webp","./img/photos/plantain.webp","./img/photos/poison-ivy.webp","./img/photos/poison-oak.webp","./img/photos/poison-sumac.webp","./img/photos/pokeweed.webp","./img/photos/prickly-pear.webp","./img/photos/purslane.webp","./img/photos/puss-caterpillar.webp","./img/photos/pygmy-rattlesnake.webp","./img/photos/rat-snake.webp","./img/photos/rosary-pea.webp","./img/photos/saddleback.webp","./img/photos/saw-palmetto.webp","./img/photos/scarlet-kingsnake.webp","./img/photos/scarlet-snake.webp","./img/photos/sea-grape.webp","./img/photos/spanish-needles.webp","./img/photos/texas-coral-snake.webp","./img/photos/timber-rattlesnake.webp","./img/photos/velvet-ant.webp","./img/photos/water-hemlock.webp","./img/photos/western-diamondback.webp","./img/photos/wild-onion.webp","./img/photos/wolf-spider.webp","./index.html","./manifest.webmanifest","./maps/fonts/Noto%20Sans%20Italic/0-255.pbf","./maps/fonts/Noto%20Sans%20Italic/256-511.pbf","./maps/fonts/Noto%20Sans%20Italic/8192-8447.pbf","./maps/fonts/Noto%20Sans%20Medium/0-255.pbf","./maps/fonts/Noto%20Sans%20Medium/256-511.pbf","./maps/fonts/Noto%20Sans%20Medium/8192-8447.pbf","./maps/fonts/Noto%20Sans%20Regular/0-255.pbf","./maps/fonts/Noto%20Sans%20Regular/256-511.pbf","./maps/fonts/Noto%20Sans%20Regular/8192-8447.pbf","./maps/sprites/dark.json","./maps/sprites/dark.png","./maps/sprites/dark%402x.json","./maps/sprites/dark%402x.png","./poi/dallas.json","./poi/south-florida.json"];

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
