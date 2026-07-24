import { fetchPrayerBoard, getMalawiTimeParts, getPrayerTimesFromPayload } from "./_lib/prayer-data.js";
import { loadSubscriptions, removeSubscription } from "./_lib/push-store.js";
import { loadReminderState, pruneReminderState, saveReminderState } from "./_lib/reminder-state.js";
import { isPushConfigured, sendPushNotification } from "./_lib/web-push.js";

const prayerReminderBody =
  "The Messenger of Allah (ﷺ) said: ‘The covenant that distinguishes between us and them is prayer; so whoever leaves it, he has committed Kufr.’";

function isAuthorized(request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    return true;
  }

  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers["x-cron-secret"];
  return bearer === expected || headerSecret === expected;
}

function getMinutes(timeValue) {
  const [hours, minutes] = String(timeValue || "")
    .split(":")
    .map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function getDuePrayers(prayers, currentMinutes, windowMinutes) {
  const lowerBound = Math.max(currentMinutes - Math.max(windowMinutes, 1) + 1, 0);

  return prayers.filter((prayer) => {
    const prayerMinutes = getMinutes(prayer.athan);

    if (prayerMinutes === null) {
      return false;
    }

    return prayerMinutes >= lowerBound && prayerMinutes <= currentMinutes;
  });
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
  const currentMinutes = getMinutes(timeKey);
  const requestedWindow = Number.parseInt(request.query?.window ?? request.headers["x-window-minutes"], 10);
  const windowMinutes = Number.isFinite(requestedWindow) ? Math.min(Math.max(requestedWindow, 1), 15) : 1;

  if (currentMinutes === null) {
    response.status(500).json({ ok: false, error: "Unable to resolve current Malawi time." });
    return;
  }

  const duePrayers = getDuePrayers(prayers, currentMinutes, windowMinutes);

  if (duePrayers.length === 0) {
    response.status(200).json({
      ok: true,
      sent: 0,
      due: [],
      windowMinutes,
      message: `No prayer reminders due at ${timeKey} on ${dateKey}.`,
    });
    return;
  }

  const subscriptions = await loadSubscriptions();
  const reminderState = pruneReminderState(await loadReminderState(), dateKey);
  const alreadySent = [];
  const pendingPrayers = duePrayers.filter((prayer) => {
    const slotKey = `${dateKey}:${prayer.label}:${prayer.athan}`;
    const hasSent = reminderState[slotKey] === dateKey;

    if (hasSent) {
      alreadySent.push(slotKey);
    }

    return !hasSent;
  });

  if (pendingPrayers.length === 0) {
    response.status(200).json({
      ok: true,
      sent: 0,
      removed: 0,
      due: duePrayers.map((prayer) => prayer.label),
      skipped: alreadySent.length,
      windowMinutes,
      timeKey,
      dateKey,
      message: "Due reminders were already sent in this window.",
    });
    return;
  }

  let sent = 0;
  const removed = [];

  for (const prayer of pendingPrayers) {
    for (const subscription of subscriptions) {
      try {
        await sendPushNotification(subscription, {
          title: `${prayer.label} time`,
          body: prayerReminderBody,
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

    reminderState[`${dateKey}:${prayer.label}:${prayer.athan}`] = dateKey;
  }

  for (const endpoint of removed) {
    await removeSubscription(endpoint);
  }

  await saveReminderState(pruneReminderState(reminderState, dateKey));

  response.status(200).json({
    ok: true,
    sent,
    removed: removed.length,
    due: pendingPrayers.map((prayer) => prayer.label),
    windowMinutes,
    timeKey,
    dateKey,
  });
}
