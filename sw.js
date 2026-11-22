/* Service worker: repeat visits load from the device. Versioned files (?v=) and images are cache-first; pages are network-first.
   The version below is rewritten on every deploy by tools/build.py, which also retires the previous cache. */
const VER = "20261122181202";
const CACHE = "ci-" + VER;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
const put = (req, res) => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;           // Google Sheets/Forms and map tiles go straight to the network
  if (r.mode === "navigate") { e.respondWith(fetch(r, { cache: "no-cache" }).then(res => put(r, res)).catch(() => caches.match(r))); return; }
  if (u.search.includes("v=") || u.pathname.includes("/images/") || u.pathname.endsWith(".png")) {
    e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => put(r, res))));
  }
});
