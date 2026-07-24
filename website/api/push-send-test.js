import { sendPushNotification, isPushConfigured } from "./_lib/web-push.js";

function isValidSubscription(subscription) {
  return Boolean(
    subscription?.endpoint &&
      subscription?.keys?.p256dh &&
      subscription?.keys?.auth,
  );
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isPushConfigured()) {
    response.status(503).json({ ok: false, error: "Push notifications are not configured." });
    return;
  }

  const subscription = request.body?.subscription;

  if (!isValidSubscription(subscription)) {
    response.status(400).json({ ok: false, error: "A valid subscription is required." });
    return;
  }

  try {
    await sendPushNotification(subscription, {
      title: "Nooriva test notification",
      body: "Notifications are working on this device.",
      url: "/settings.html",
      prayer: "test",
    });

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error?.body || error?.message || "Unable to send test notification.",
    });
  }
}
