import { addMessage } from "./_lib/message-store.js";
import { loadSubscriptions, removeSubscription } from "./_lib/push-store.js";
import { isPushConfigured, sendPushNotification } from "./_lib/web-push.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const name = String(request.body?.name ?? "").trim();
  const message = String(request.body?.message ?? "").trim();

  if (name.length < 2 || message.length < 2) {
    response.status(400).json({ ok: false, error: "Name and message are required." });
    return;
  }

  const saved = await addMessage({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    message,
    createdAt: new Date().toISOString(),
  });

  if (isPushConfigured()) {
    const subscriptions = await loadSubscriptions();
    const removed = [];

    for (const subscription of subscriptions) {
      try {
        await sendPushNotification(subscription, {
          title: "New message",
          body: `${name}: ${message.slice(0, 90)}`,
          url: "/account.html",
        });
      } catch (error) {
        const statusCode = error?.statusCode ?? error?.status ?? 0;
        if (statusCode === 404 || statusCode === 410) {
          removed.push(subscription.endpoint);
        }
      }
    }

    for (const endpoint of removed) {
      await removeSubscription(endpoint);
    }
  }

  response.status(200).json({ ok: true, message: saved });
}
