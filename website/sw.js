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
      icon: "./assets/nooriva-logo-transparent.png",
      badge: "./assets/nooriva-logo-transparent.png",
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

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Network-first is enough for installability right now.
});
