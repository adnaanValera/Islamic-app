import { loadChecklistStateMap, pruneChecklistStateMap } from "./_lib/prayer-checklist-state.js";
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

function normalizeCurrentMinutes(prayers, currentMinutes) {
  const hasOvernightPrayer = prayers.some((prayer) => {
    const startMinutes = getMinutes(prayer.salah);
    const endMinutes = getMinutes(prayer.endTime);
    return startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes;
  });

  if (!hasOvernightPrayer) {
    return currentMinutes;
  }

  const earlyMorningCutoff = 6 * 60;
  return currentMinutes < earlyMorningCutoff ? currentMinutes + 24 * 60 : currentMinutes;
}

function getDuePrayers(prayers, currentMinutes, windowMinutes) {
  const lowerBound = Math.max(currentMinutes - Math.max(windowMinutes, 1), 0);

  return prayers.filter((prayer) => {
    const prayerMinutes = getMinutes(prayer.athan);

    if (prayerMinutes === null) {
      return false;
    }

    const normalizedPrayerMinutes = prayerMinutes < lowerBound && currentMinutes > 24 * 60 ? prayerMinutes + 24 * 60 : prayerMinutes;
    return normalizedPrayerMinutes >= lowerBound && normalizedPrayerMinutes <= currentMinutes;
  });
}

function getPrayerWindows(prayers) {
  return prayers
    .map((prayer, index) => {
      const startMinutes = getMinutes(prayer.salah);
      let endMinutes = getMinutes(prayer.endTime);

      if (startMinutes === null) {
        return null;
      }

      if (endMinutes === null) {
        if (index < prayers.length - 1) {
          endMinutes = getMinutes(prayers[index + 1]?.salah);
        } else {
          endMinutes = getMinutes(prayers[0]?.salah);
        }
      }

      if (endMinutes === null) {
        return null;
      }

      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }

      return {
        ...prayer,
        startMinutes,
        endMinutes,
      };
    })
    .filter(Boolean);
}

function getDueRunningOutReminders(prayers, currentMinutes, windowMinutes) {
  const lowerBound = Math.max(currentMinutes - Math.max(windowMinutes, 1), 0);

  return getPrayerWindows(prayers).flatMap((prayer) => {
    const checkpoints = [];
    let checkpointMinutes = prayer.startMinutes + 30;

    while (checkpointMinutes < prayer.endMinutes) {
      if (checkpointMinutes >= lowerBound && checkpointMinutes <= currentMinutes) {
        checkpoints.push({
          ...prayer,
          checkpointMinutes,
        });
      }

      checkpointMinutes += 30;
    }

    return checkpoints;
  });
}

function isPrayerChecked(checklistStates, endpoint, dateKey, prayerLabel) {
  const state = checklistStates[endpoint];
  return Boolean(state?.dateKey === dateKey && state?.checked?.[prayerLabel]);
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
  const rawCurrentMinutes = getMinutes(timeKey);
  const requestedWindow = Number.parseInt(request.query?.window ?? request.headers["x-window-minutes"], 10);
  const windowMinutes = Number.isFinite(requestedWindow) ? Math.min(Math.max(requestedWindow, 1), 30) : 5;

  if (rawCurrentMinutes === null) {
    response.status(500).json({ ok: false, error: "Unable to resolve current Malawi time." });
    return;
  }

  const currentMinutes = normalizeCurrentMinutes(prayers, rawCurrentMinutes);
  const duePrayers = getDuePrayers(prayers, currentMinutes, windowMinutes);
  const dueRunningOut = getDueRunningOutReminders(prayers, currentMinutes, windowMinutes);

  if (duePrayers.length === 0 && dueRunningOut.length === 0) {
    response.status(200).json({
      ok: true,
      sent: 0,
      due: [],
      runningOut: [],
      windowMinutes,
      message: `No prayer reminders due at ${timeKey} on ${dateKey}.`,
    });
    return;
  }

  const subscriptions = await loadSubscriptions();
  const checklistStates = pruneChecklistStateMap(await loadChecklistStateMap(), dateKey);
  const reminderState = pruneReminderState(await loadReminderState(), dateKey);
  const alreadySent = [];

  const pendingPrayers = duePrayers.filter((prayer) => {
    const slotKey = `${dateKey}:start:${prayer.label}:${prayer.athan}`;
    const hasSent = reminderState[slotKey] === dateKey;

    if (hasSent) {
      alreadySent.push(slotKey);
    }

    return !hasSent;
  });

  const pendingRunningOut = dueRunningOut.filter((prayer) => {
    const slotKey = `${dateKey}:running:${prayer.label}:${prayer.checkpointMinutes}`;
    const hasSent = reminderState[slotKey] === dateKey;

    if (hasSent) {
      alreadySent.push(slotKey);
    }

    return !hasSent;
  });

  if (pendingPrayers.length === 0 && pendingRunningOut.length === 0) {
    response.status(200).json({
      ok: true,
      sent: 0,
      removed: 0,
      due: duePrayers.map((prayer) => prayer.label),
      runningOut: dueRunningOut.map((prayer) => prayer.label),
      skipped: alreadySent.length,
      windowMinutes,
      timeKey,
      dateKey,
      message: "Due reminders were already sent in this window.",
    });
    return;
  }

  let sent = 0;
  let failed = 0;
  const removed = new Set();

  for (const prayer of pendingPrayers) {
    for (const subscription of subscriptions) {
      if (isPrayerChecked(checklistStates, subscription.endpoint, dateKey, prayer.label)) {
        continue;
      }

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
          removed.add(subscription.endpoint);
        } else {
          failed += 1;
        }
      }
    }

    reminderState[`${dateKey}:start:${prayer.label}:${prayer.athan}`] = dateKey;
  }

  for (const prayer of pendingRunningOut) {
    for (const subscription of subscriptions) {
      if (isPrayerChecked(checklistStates, subscription.endpoint, dateKey, prayer.label)) {
        continue;
      }

      try {
        await sendPushNotification(subscription, {
          title: `${prayer.label} time is running out!!!`,
          body: `${prayer.label} time is running out!!!`,
          prayer: prayer.label,
          time: prayer.salah,
          url: "/prayer.html",
        });
        sent += 1;
      } catch (error) {
        const statusCode = error?.statusCode ?? error?.status ?? 0;

        if (statusCode === 404 || statusCode === 410) {
          removed.add(subscription.endpoint);
        } else {
          failed += 1;
        }
      }
    }

    reminderState[`${dateKey}:running:${prayer.label}:${prayer.checkpointMinutes}`] = dateKey;
  }

  for (const endpoint of removed) {
    await removeSubscription(endpoint);
  }

  await saveReminderState(pruneReminderState(reminderState, dateKey));

  response.status(200).json({
    ok: true,
    sent,
    failed,
    removed: removed.size,
    due: pendingPrayers.map((prayer) => prayer.label),
    runningOut: pendingRunningOut.map((prayer) => prayer.label),
    windowMinutes,
    timeKey,
    dateKey,
  });
}
