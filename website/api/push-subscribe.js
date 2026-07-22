import { isPushStorageConfigured, upsertSubscription } from "./_lib/push-store.js";
import { isPushConfigured } from "./_lib/web-push.js";

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
    response.status(503).json({
      ok: false,
      error: "Push notifications are not configured on the server yet.",
    });
    return;
  }

  if (!isPushStorageConfigured()) {
    response.status(503).json({
      ok: false,
      error: "Push subscription storage is not configured yet.",
    });
    return;
  }

  const subscription = request.body?.subscription;

  if (!isValidSubscription(subscription)) {
    response.status(400).json({
      ok: false,
      error: "A valid push subscription is required.",
    });
    return;
  }

  const count = await upsertSubscription(subscription);
  response.status(200).json({ ok: true, subscriptions: count });
}
