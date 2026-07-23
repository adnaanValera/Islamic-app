const prayerApiUrl = "/api/prayer-times";
const pushPublicKeyApiUrl = "/api/push-public-key";
const pushSubscribeApiUrl = "/api/push-subscribe";
const pushUnsubscribeApiUrl = "/api/push-unsubscribe";
const malawiTimeZone = "Africa/Blantyre";

const prayers = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", label: "Fajr" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", label: "Zuhr" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", label: "Asr" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", label: "Maghrib" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", label: "Esha" },
];

const startTimings = [
  { key: "sehriEnds", label: "Suhoor ends" },
  { key: "fajrStarts", label: "Fajr starts" },
  { key: "sunrise", label: "Sunrise" },
  { key: "ishraaq", label: "Ishraaq" },
  { key: "duha", label: "Duha" },
  { key: "istiwa", label: "Istiwa" },
  { key: "zawaalEnd", label: "Zawaal ends" },
  { key: "asrShafi", label: "Asr (Shafi)" },
  { key: "asrHanafi", label: "Asr (Hanafi)" },
  { key: "sunset", label: "Sunset" },
  { key: "eshaStarts", label: "Esha starts" },
];

let latestPrayerTimes = [];
let nextPrayerNotificationTimeout = null;
let serviceWorkerRegistration = null;
let pushPublicKey = "";
let backendPushReady = false;
const notificationIcon = "./assets/icon-192.png";
const notificationBadge = "./assets/favicon-32.png";

const prayerTimeList = document.getElementById("prayer-time-list");
const jumuahTimeList = document.getElementById("jumuah-time-list");
const timingsList = document.getElementById("timings-list");
const endTimesList = document.getElementById("end-times-list");
const nextPrayerLabel = document.getElementById("next-prayer-label");
const nextPrayerName = document.getElementById("next-prayer-name");
const nextPrayerTime = document.getElementById("next-prayer-time");
const nextPrayerCountdown = document.getElementById("next-prayer-countdown");
const nextPrayerProgressFill = document.getElementById("next-prayer-progress-fill");
const prayerStatus = document.getElementById("prayer-status");
const notificationButton = document.getElementById("enable-notifications");
const downloadAppButton = document.getElementById("download-app");
const prayerActions = document.getElementById("prayer-actions");
const prayerChecklistStorageKey = "nooriva-prayer-checklist";
let lastPrayerRefreshSlot = "";

function getMalawiDateParts() {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: malawiTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    timeKey: `${values.hour}:${values.minute}`,
    timeDisplay: `${values.hour}:${values.minute}`,
  };
}

function getMinutesFromTimeString(timeValue) {
  const [hours, minutes] = String(timeValue || "")
    .split(":")
    .map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatCountdown(totalMinutes) {
  if (totalMinutes <= 0) {
    return "Starting now";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }

  return `${minutes}m remaining`;
}

function formatFriendlyCountdown(totalMinutes, prayerLabel) {
  if (totalMinutes <= 0) {
    return `${prayerLabel} is starting now`;
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"} until ${prayerLabel}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} until ${prayerLabel}`;
  }

  return `${hours}h ${minutes}m until ${prayerLabel}`;
}

function getChecklistState() {
  const { dateKey } = getMalawiDateParts();
  const raw = localStorage.getItem(prayerChecklistStorageKey);

  if (!raw) {
    return { dateKey, checked: {} };
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.dateKey !== dateKey) {
      return { dateKey, checked: {} };
    }

    return {
      dateKey,
      checked: parsed.checked ?? {},
    };
  } catch (error) {
    return { dateKey, checked: {} };
  }
}

function saveChecklistState(checked) {
  const { dateKey } = getMalawiDateParts();
  localStorage.setItem(
    prayerChecklistStorageKey,
    JSON.stringify({
      dateKey,
      checked,
    }),
  );
}

function resetChecklistIfNeeded() {
  const checklist = getChecklistState();
  saveChecklistState(checklist.checked);
}

function renderPrayerTimes() {
  if (!prayerTimeList) {
    return;
  }

  const { timeKey } = getMalawiDateParts();
  const checklist = getChecklistState();
  const currentMinutes = getMinutesFromTimeString(timeKey) ?? 0;
  const prayerWindows = latestPrayerTimes.map((prayer, index) => {
    const startMinutes = getMinutesFromTimeString(prayer.athan) ?? 0;
    const nextStart =
      index < latestPrayerTimes.length - 1
        ? getMinutesFromTimeString(latestPrayerTimes[index + 1].athan) ?? startMinutes
        : 24 * 60;

    return {
      ...prayer,
      startMinutes,
      nextStart,
    };
  });

  const nextPrayer =
    prayerWindows.find((prayer) => prayer.startMinutes >= currentMinutes) ?? prayerWindows[0];
  const currentPrayer =
    prayerWindows.find(
      (prayer) =>
        currentMinutes >= prayer.startMinutes &&
      currentMinutes < prayer.nextStart,
    ) ?? null;
  const nextPrayerMinutes =
    nextPrayer && nextPrayer.startMinutes < currentMinutes
      ? nextPrayer.startMinutes + 24 * 60
      : nextPrayer?.startMinutes ?? currentMinutes;
  const minutesUntilNext = nextPrayerMinutes - currentMinutes;

  if (nextPrayerName) {
    nextPrayerName.textContent = currentPrayer?.label ?? nextPrayer?.label ?? "Prayer times";
  }

  if (nextPrayerTime) {
    nextPrayerTime.textContent = currentPrayer?.athan ?? nextPrayer?.athan ?? "--:--";
  }

  if (nextPrayerCountdown) {
    nextPrayerCountdown.textContent = currentPrayer
      ? `${currentPrayer.label} is now active`
      : formatFriendlyCountdown(minutesUntilNext, nextPrayer?.label ?? "the next prayer");
  }

  if (nextPrayerLabel) {
    nextPrayerLabel.textContent = currentPrayer ? "Current prayer" : "Next prayer";
  }

  if (nextPrayerProgressFill) {
    if (currentPrayer) {
      const windowLength = Math.max(currentPrayer.nextStart - currentPrayer.startMinutes, 1);
      const elapsed = Math.min(
        Math.max(currentMinutes - currentPrayer.startMinutes, 0),
        windowLength,
      );
      const progress = Math.max(6, Math.min((elapsed / windowLength) * 100, 100));
      nextPrayerProgressFill.style.width = `${progress}%`;
    } else {
      const capped = nextPrayer ? Math.max(0, Math.min(100 - minutesUntilNext, 24)) : 0;
      nextPrayerProgressFill.style.width = `${capped}%`;
    }
  }

  prayerTimeList.innerHTML = prayerWindows
    .map(
      (prayer) => `
        <div class="prayer-time-row${currentPrayer?.label === prayer.label ? " is-current" : ""}${nextPrayer?.label === prayer.label ? " is-next" : ""}${checklist.checked?.[prayer.label] ? " is-completed" : ""}">
          <label class="prayer-check" aria-label="Mark ${prayer.label} as completed">
            <input type="checkbox" data-prayer-check="${prayer.label}" ${checklist.checked?.[prayer.label] ? "checked" : ""} />
            <span></span>
          </label>
          <span class="prayer-name">${prayer.label}</span>
          <strong class="prayer-time-value">${prayer.athan}</strong>
          <strong class="prayer-time-value">${prayer.salah}</strong>
        </div>
      `,
    )
    .join("");

  prayerTimeList.querySelectorAll("[data-prayer-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const current = getChecklistState();
      current.checked[event.target.dataset.prayerCheck] = event.target.checked;
      saveChecklistState(current.checked);
      renderPrayerTimes();
    });
  });
}

function renderJumuahTimes(times) {
  if (!jumuahTimeList) {
    return;
  }

  jumuahTimeList.innerHTML = `
    <div class="jumuah-time-row">
      <strong>${times.adhan}</strong>
      <strong class="align-right">${times.khutbah}</strong>
    </div>
  `;
}

function renderStartTimings(items) {
  if (!timingsList) {
    return;
  }

  timingsList.innerHTML = items
    .map(
      (item) => `
        <div class="timing-row">
          <span>${item.label}</span>
          <strong>${item.time}</strong>
        </div>
      `,
    )
    .join("");
}

function renderEndTimings(items) {
  if (!endTimesList) {
    return;
  }

  endTimesList.innerHTML = items
    .map(
      (item) => `
        <div class="timing-row">
          <span>${item.label}</span>
          <strong>${item.time}</strong>
        </div>
      `,
    )
    .join("");
}

function updateNotificationStatus() {
  if (!notificationButton) {
    return;
  }

  if (!("Notification" in window)) {
    notificationButton.disabled = true;
    notificationButton.textContent = "Notifications unavailable";
    return;
  }

  if (Notification.permission === "granted") {
    notificationButton.style.display = "none";
    updateActionVisibility();
    scheduleNextPrayerNotification();
    return;
  }

  if (Notification.permission === "denied") {
    notificationButton.textContent = "Notifications blocked";
    notificationButton.disabled = true;
    notificationButton.style.display = "";
    return;
  }

  notificationButton.style.display = "";
  notificationButton.disabled = false;
}

function updateActionVisibility() {
  if (!prayerActions) {
    return;
  }

  if (downloadAppButton && window.noorivaInstall?.isStandaloneApp?.()) {
    downloadAppButton.style.display = "none";
  }

  const visibleButtons = prayerActions.querySelectorAll(
    ".button:not([style*='display: none'])",
  );

  if (visibleButtons.length === 0) {
    prayerActions.classList.add("prayer-actions-hidden");
    return;
  }

  prayerActions.classList.remove("prayer-actions-hidden");
}

async function registerServiceWorker() {
  serviceWorkerRegistration = await window.noorivaInstall?.registerServiceWorker?.();
  return serviceWorkerRegistration;
}

function base64UrlToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }

  return output;
}

async function loadPushPublicKey() {
  try {
    const response = await fetch(pushPublicKeyApiUrl, { cache: "no-store" });

    if (!response.ok) {
      return "";
    }

    const payload = await response.json();
    pushPublicKey = payload?.configured ? payload?.publicKey ?? "" : "";
    backendPushReady = Boolean(pushPublicKey);
    return pushPublicKey;
  } catch (error) {
    backendPushReady = false;
    return "";
  }
}

async function showVerificationNotification() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = serviceWorkerRegistration ?? (await navigator.serviceWorker.ready.catch(() => null));

  if (!registration) {
    return;
  }

  await registration.showNotification("Nooriva notifications enabled", {
    body: backendPushReady
      ? "Prayer reminders are ready on this device, including backend push when available."
      : "Prayer reminders are ready while Nooriva is open or installed on this device.",
    icon: notificationIcon,
    badge: notificationBadge,
    tag: "nooriva-notification-check",
    renotify: false,
  });
}

async function subscribeToBackendPush() {
  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    Notification.permission !== "granted"
  ) {
    return false;
  }

  const registration = serviceWorkerRegistration ?? (await navigator.serviceWorker.ready.catch(() => null));

  if (!registration) {
    return false;
  }

  const publicKey = pushPublicKey || (await loadPushPublicKey());

  if (!publicKey) {
    return false;
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey),
    });
  }

  try {
    const response = await fetch(pushSubscribeApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

async function removeBackendPushSubscription() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = serviceWorkerRegistration ?? (await navigator.serviceWorker.ready.catch(() => null));
  const subscription = await registration?.pushManager?.getSubscription?.();

  if (!subscription) {
    return;
  }

  await fetch(pushUnsubscribeApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => undefined);
}

async function showPrayerNotification(prayer) {
  const title = `${prayer.label} time`;
  const body = `It is now time for ${prayer.label} in Malawi.`;
  const icon = notificationIcon;
  const badge = notificationBadge;
  const tag = `prayer-${prayer.label.toLowerCase()}`;

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);

    if (registration) {
      await registration.showNotification(title, {
        body,
        icon,
        badge,
        tag,
        renotify: true,
      });
      return true;
    }
  }

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon, badge, tag });
    return true;
  }

  return false;
}

function getNotificationSupportMode() {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  if (window.noorivaInstall?.isStandaloneApp?.()) {
    return "standalone";
  }

  return "browser";
}

function clearScheduledPrayerNotification() {
  if (nextPrayerNotificationTimeout) {
    window.clearTimeout(nextPrayerNotificationTimeout);
    nextPrayerNotificationTimeout = null;
  }
}

function getNextUpcomingPrayer() {
  if (latestPrayerTimes.length === 0) {
    return null;
  }

  const { dateKey, timeKey } = getMalawiDateParts();
  const currentMinutes = getMinutesFromTimeString(timeKey) ?? 0;
  const prayerWindows = latestPrayerTimes.map((prayer) => ({
    ...prayer,
    startMinutes: getMinutesFromTimeString(prayer.athan) ?? 0,
  }));

  const nextPrayer =
    prayerWindows.find((prayer) => prayer.startMinutes > currentMinutes) ?? prayerWindows[0];
  const nextPrayerMinutes =
    nextPrayer.startMinutes > currentMinutes
      ? nextPrayer.startMinutes
      : nextPrayer.startMinutes + 24 * 60;

  return {
    prayer: nextPrayer,
    waitMs: Math.max((nextPrayerMinutes - currentMinutes) * 60 * 1000, 0),
    dateKey,
  };
}

function scheduleNextPrayerNotification() {
  clearScheduledPrayerNotification();

  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const upcoming = getNextUpcomingPrayer();

  if (!upcoming) {
    return;
  }

  const bufferedDelay = Math.min(upcoming.waitMs + 1500, 2147483647);

  nextPrayerNotificationTimeout = window.setTimeout(async () => {
    await maybeSendPrayerNotification();
    scheduleNextPrayerNotification();
  }, bufferedDelay);
}

async function loadPrayerTimes() {
  try {
    prayerStatus.textContent = "Refreshing live prayer times...";

    const response = await fetch(prayerApiUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Prayer API returned ${response.status}`);
    }

    const payload = await response.json();
    const data = payload?.data;
    latestPrayerTimes = prayers.map((prayer) => ({
      label: prayer.label,
      athan: data?.[prayer.athanKey] ?? "--:--",
      salah: data?.[prayer.salahKey] ?? "--:--",
    }));

    renderPrayerTimes();
    renderJumuahTimes({
      adhan: data?.jumuahTime1 || "--:--",
      khutbah: data?.jumuahTime3 || "--:--",
    });
    renderStartTimings(
      startTimings.map((timing) => ({
        label: timing.label,
        time: data?.[timing.key] || "--:--",
      })),
    );
    renderEndTimings([
      { label: "Fajr", time: data?.sunrise || "--:--" },
      { label: "Zuhr", time: data?.asrShafi || "--:--" },
      { label: "Asr", time: data?.sunset || "--:--" },
      { label: "Maghrib", time: data?.eshaStarts || "--:--" },
    ]);

    prayerStatus.textContent = "Prayer times updated.";
    scheduleNextPrayerNotification();
  } catch (error) {
    prayerStatus.textContent = "We couldn't refresh the prayer times just now.";
  }
}

async function maybeSendPrayerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const { dateKey, timeKey } = getMalawiDateParts();

  for (const prayer of latestPrayerTimes) {
    const storageKey = `nooriva-notified-${dateKey}-${prayer.label.toLowerCase()}`;

    if (prayer.athan === timeKey && !localStorage.getItem(storageKey)) {
      const shown = await showPrayerNotification(prayer);

      if (shown) {
        localStorage.setItem(storageKey, "true");
      }
    }
  }
}

if (notificationButton) {
  notificationButton.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      updateNotificationStatus();
      updateActionVisibility();
      return;
    }

    const permission = await Notification.requestPermission();
    updateNotificationStatus();
    updateActionVisibility();

    if (permission === "granted") {
      const pushSubscribed = await subscribeToBackendPush();
      prayerStatus.textContent = pushSubscribed
        ? "Notifications enabled. Nooriva will use installed-app reminders and server push for stronger closed-app delivery."
        : getNotificationSupportMode() === "browser"
          ? "Notifications enabled. For the best mobile reminder reliability, install Nooriva to your home screen."
          : "Notifications enabled for upcoming prayer reminders while Nooriva is open or installed.";
      await showVerificationNotification();
      await maybeSendPrayerNotification();
      scheduleNextPrayerNotification();
    }
  });
}

if (downloadAppButton) {
  downloadAppButton.addEventListener("click", async () => {
    const installResult = await window.noorivaInstall?.triggerInstall?.();

    if (installResult === "installed" || installResult === "standalone") {
      downloadAppButton.style.display = "none";
      updateActionVisibility();
      return;
    }

    prayerStatus.textContent = "Use your browser's install option to add Nooriva to your device.";
  });
}

resetChecklistIfNeeded();
updateNotificationStatus();
updateActionVisibility();
registerServiceWorker().then(() => {
  if (Notification.permission === "granted") {
    subscribeToBackendPush().catch(() => undefined);
    showVerificationNotification().catch(() => undefined);
  }
});
loadPushPublicKey();
loadPrayerTimes();

window.addEventListener("nooriva:install-available", () => {
  if (downloadAppButton && !window.noorivaInstall?.isStandaloneApp()) {
    downloadAppButton.style.display = "inline-flex";
  }
  updateActionVisibility();
});

window.addEventListener("nooriva:installed", () => {
  if (downloadAppButton) {
    downloadAppButton.style.display = "none";
  }

  updateActionVisibility();
  if (Notification.permission === "granted") {
    subscribeToBackendPush().catch(() => undefined);
  }
  scheduleNextPrayerNotification();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    maybeSendPrayerNotification();
    scheduleNextPrayerNotification();
    loadPrayerTimes();
    if (Notification.permission === "granted") {
      subscribeToBackendPush().catch(() => undefined);
    }
  }
});

function maybeRefreshOnPrayerSchedule() {
  const { dateKey, timeKey } = getMalawiDateParts();
  const slotKey = `${dateKey}-${timeKey}`;

  if ((timeKey === "00:00" || timeKey === "12:00") && lastPrayerRefreshSlot !== slotKey) {
    lastPrayerRefreshSlot = slotKey;
    loadPrayerTimes();
  }
}

setInterval(() => {
  resetChecklistIfNeeded();
  maybeRefreshOnPrayerSchedule();
  if (latestPrayerTimes.length > 0) {
    renderPrayerTimes();
  }
}, 1000);
setInterval(() => {
  maybeSendPrayerNotification();
}, 15000);
