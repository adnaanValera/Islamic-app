import webpush from "web-push";

export function isPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

export function getPushPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? "";
}

export function configureWebPush() {
  if (!isPushConfigured()) {
    return false;
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  return true;
}

export async function sendPushNotification(subscription, payload) {
  configureWebPush();
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
