const CACHE = "mis-gastos-v2";

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.add("/")));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  // Dejar pasar llamadas a APIs externas sin cachear
  if (url.includes("supabase.co") || url.includes("dolarapi.com")) {
    e.respondWith(fetch(e.request).catch(() => new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } })));
    return;
  }
  // Network-first para todo lo demás (cae a cache si está offline)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
