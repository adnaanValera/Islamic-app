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

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Network-first is enough for installability right now.
});
