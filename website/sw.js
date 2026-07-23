const STATIC_CACHE = "nooriva-static-v14";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/prayer.html",
  "/qibla.html",
  "/quran.html",
  "/tasbeeh.html",
  "/dhikr.html",
  "/account.html",
  "/settings.html",
  "/styles.css",
  "/install-app.js",
  "/mobile-nav.js",
  "/prayer-times.js",
  "/qibla.js",
  "/quran.js",
  "/tasbeeh.js",
  "/account.js",
  "/settings.js",
  "/manifest.webmanifest",
  "/assets/favicon-32.png",
  "/assets/apple-touch-icon.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/assets/nooriva-app-icon.png",
  "/assets/nooriva-logo-transparent.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const payload = event.data;

  if (payload?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (payload?.type !== "SHOW_PRAYER_NOTIFICATION") {
    return;
  }

  const { title, body, icon, badge, tag } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      renotify: true,
    }),
  );
});

self.addEventListener("push", (event) => {
  const payload = event.data?.json?.() ?? {
    title: "Prayer time",
    body: "It is time for prayer.",
    url: "/prayer.html",
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "./assets/icon-192.png",
      badge: "./assets/favicon-32.png",
      tag: payload.prayer ? `prayer-${String(payload.prayer).toLowerCase()}` : "nooriva-prayer",
      data: {
        url: payload.url ?? "/prayer.html",
      },
      renotify: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/prayer.html";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existingClient = clients.find((client) => client.url.includes(targetUrl));

      if (existingClient) {
        return existingClient.focus();
      }

      return self.clients.openWindow(targetUrl);
    }),
  );
});

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);

  try {
    const fresh = await fetch(request, { cache: "no-store" });

    if (fresh && fresh.status === 200) {
      cache.put(request, fresh.clone());
    }

    return fresh;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      return cache.match("/index.html");
    }

    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  return cached || networkPromise;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  const isDocumentRequest =
    event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/";

  if (isDocumentRequest) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
