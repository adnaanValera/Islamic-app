import { fetchPrayerBoard, getMalawiTimeParts, getPrayerTimesFromPayload } from "./_lib/prayer-data.js";
import { loadSubscriptions, removeSubscription } from "./_lib/push-store.js";
import { isPushConfigured, sendPushNotification } from "./_lib/web-push.js";

function isAuthorized(request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return true;
  }

  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers["x-cron-secret"];
  return bearer === expected || headerSecret === expected;
}

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAuthorized(request)) {
    response.status(401).json({ ok: false, error: "Unauthorized." });
    return;
  }

  if (!isPushConfigured()) {
    response.status(503).json({ ok: false, error: "Push notifications are not configured." });
    return;
  }

  const payload = await fetchPrayerBoard();
  const prayers = getPrayerTimesFromPayload(payload);
  const { dateKey, timeKey } = getMalawiTimeParts();
  const duePrayers = prayers.filter((prayer) => prayer.athan === timeKey);

  if (duePrayers.length === 0) {
    response.status(200).json({
      ok: true,
      sent: 0,
      due: [],
      message: `No prayer reminders due at ${timeKey} on ${dateKey}.`,
    });
    return;
  }

  const subscriptions = await loadSubscriptions();
  let sent = 0;
  const removed = [];

  for (const prayer of duePrayers) {
    for (const subscription of subscriptions) {
      try {
        await sendPushNotification(subscription, {
          title: `${prayer.label} time`,
          body: `It is now time for ${prayer.label} in Malawi.`,
          prayer: prayer.label,
          time: prayer.athan,
          url: "/prayer.html",
        });
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode ?? error?.status ?? 0;

        if (statusCode === 404 || statusCode === 410) {
          removed.push(subscription.endpoint);
        }
      }
    }
  }

  for (const endpoint of removed) {
    await removeSubscription(endpoint);
  }

  response.status(200).json({
    ok: true,
    sent,
    removed: removed.length,
    due: duePrayers.map((prayer) => prayer.label),
    timeKey,
    dateKey,
  });
}
