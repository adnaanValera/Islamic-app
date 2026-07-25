import webpush from "web-push";

function normalizeVapidSubject(value) {
  const subject = String(value ?? "").trim();

  if (!subject) {
    return "";
  }

  if (/^https:\/\//i.test(subject) || /^mailto:/i.test(subject)) {
    return subject;
  }

  if (/^malito:/i.test(subject)) {
    return subject.replace(/^malito:/i, "mailto:");
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(subject)) {
    return `mailto:${subject}`;
  }

  return subject;
}

export function isPushConfigured() {
  const normalizedSubject = normalizeVapidSubject(process.env.VAPID_SUBJECT);

  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      normalizedSubject,
  );
}

export function getPushPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? "";
}

export function configureWebPush() {
  if (!isPushConfigured()) {
    return false;
  }

  const vapidSubject = normalizeVapidSubject(process.env.VAPID_SUBJECT);

  webpush.setVapidDetails(
    vapidSubject,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  return true;
}

export async function sendPushNotification(subscription, payload) {
  configureWebPush();
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
