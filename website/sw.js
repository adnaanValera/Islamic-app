self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open("nooriva-static-v2")
      .then((cache) =>
        cache.addAll([
          "/",
          "/index.html",
          "/prayer.html",
          "/qibla.html",
          "/tasbeeh.html",
          "/settings.html",
          "/styles.css",
          "/install-app.js",
          "/mobile-nav.js",
          "/prayer-times.js",
          "/qibla.js",
          "/tasbeeh.js",
          "/settings.js",
          "/manifest.webmanifest",
          "/assets/favicon-32.png",
          "/assets/apple-touch-icon.png",
          "/assets/icon-192.png",
          "/assets/icon-512.png",
          "/assets/nooriva-app-icon.png",
          "/assets/nooriva-logo-transparent.png",
        ]),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("message", (event) => {
  const payload = event.data;

  if (!payload || payload.type !== "SHOW_PRAYER_NOTIFICATION") {
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

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== "nooriva-static-v2").map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open("nooriva-static-v2");
        return cache.match("/prayer.html") || Response.error();
      }),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseClone = networkResponse.clone();
            caches.open("nooriva-static-v2").then((cache) => cache.put(event.request, responseClone));
          }

          return networkResponse;
        })
        .catch(() => caches.match("/index.html"));
    }),
  );
});
