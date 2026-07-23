import { fetchAyahOfTheDay } from "./_lib/ayah-of-day.js";
import { getMalawiTimeParts } from "./_lib/prayer-data.js";
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

  const { dateKey, timeKey } = getMalawiTimeParts();

  if (timeKey !== "11:00") {
    response.status(200).json({
      ok: true,
      sent: 0,
      message: `No ayah notification due at ${timeKey} on ${dateKey}.`,
    });
    return;
  }

  const ayah = await fetchAyahOfTheDay();
  const subscriptions = await loadSubscriptions();
  const removed = [];
  let sent = 0;

  for (const subscription of subscriptions) {
    try {
      await sendPushNotification(subscription, {
        title: "Ayah of the day",
        body: `${ayah.surahName} ${ayah.ayahInSurah}: ${ayah.english}`,
        arabic: ayah.arabic,
        reference: `${ayah.surahName} ${ayah.ayahInSurah}`,
        url: "/index.html",
      });
      sent += 1;
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

  response.status(200).json({
    ok: true,
    sent,
    removed: removed.length,
    dateKey,
    timeKey,
    reference: `${ayah.surahName} ${ayah.ayahInSurah}`,
  });
}
