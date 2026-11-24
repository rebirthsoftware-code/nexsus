/*
 * Nexus Yönetim Paneli - service worker
 * Görevleri:
 *  1. Paneli "uygulama" olarak yüklenebilir kılmak ve bağlantı yokken de açabilmek
 *  2. Sunucudan gelen anlık bildirimleri (push) göstermek
 *  3. Bildirime tıklanınca paneli ilgili başvuruda açmak
 * Kapsamı yalnızca /admin/ yoludur; herkese açık siteyi etkilemez.
 */
const CACHE = "nexus-panel-v1";
const SCOPE = self.registration.scope; // ör. https://site/nexsus/admin/

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith("nexus-panel-") && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // veritabanı istekleri önbelleğe alınmaz

  // Sayfanın kendisi: önce ağ (güncel sürüm), bağlantı yoksa son kaydedilen kopya
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) (await caches.open(CACHE)).put(SCOPE, response.clone());
          return response;
        } catch {
          return (await caches.match(SCOPE)) || Response.error();
        }
      })()
    );
    return;
  }

  // Değişmeyen dosyalar (derleme çıktıları, yazı tipleri, görseller): önce önbellek
  const isStatic = url.pathname.includes("/_next/static/") || /\.(?:png|svg|woff2|webmanifest)$/.test(url.pathname);
  if (!isStatic) return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) (await caches.open(CACHE)).put(request, response.clone());
      return response;
    })()
  );
});

// Sunucudan gelen bildirim: { title, body, id }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const id = typeof data.id === "string" ? data.id : undefined;
  event.waitUntil(
    self.registration.showNotification(data.title || "Nexus", {
      body: data.body || "Yeni bir üyelik başvurusu var.",
      icon: new URL("../icons/admin-192.png", SCOPE).href,
      badge: new URL("../icons/badge-96.png", SCOPE).href,
      tag: id ? `basvuru-${id}` : "nexus-panel",
      data: { id, url: id ? `${SCOPE}?b=${encodeURIComponent(id)}` : SCOPE },
    })
  );
});

// Bildirime tıklanınca: açık panel varsa onu öne getir, yoksa yeni pencere aç
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { id, url } = event.notification.data || {};
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((c) => c.url.startsWith(SCOPE));
      if (open) {
        await open.focus();
        if (id) open.postMessage({ type: "basvuru-ac", id });
        return;
      }
      await self.clients.openWindow(url || SCOPE);
    })()
  );
});
