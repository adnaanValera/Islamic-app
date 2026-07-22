import { isPushStorageConfigured, removeSubscription } from "./_lib/push-store.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isPushStorageConfigured()) {
    response.status(200).json({ ok: true, subscriptions: 0 });
    return;
  }

  const endpoint = request.body?.endpoint;

  if (!endpoint) {
    response.status(400).json({ ok: false, error: "Endpoint is required." });
    return;
  }

  const count = await removeSubscription(endpoint);
  response.status(200).json({ ok: true, subscriptions: count });
}
