const prayerApiUrl = "/api/prayer-times";
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

const prayerTimeList = document.getElementById("prayer-time-list");
const jumuahTimeList = document.getElementById("jumuah-time-list");
const timingsList = document.getElementById("timings-list");
const prayerStatus = document.getElementById("prayer-status");
const lastUpdated = document.getElementById("last-updated");
const malawiTime = document.getElementById("malawi-time");
const boardLocation = document.getElementById("board-location");
const refreshButton = document.getElementById("refresh-prayers");
const notificationButton = document.getElementById("enable-notifications");
const downloadAppButton = document.getElementById("download-app");
const prayerActions = document.getElementById("prayer-actions");

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

function updateMalawiClock() {
  if (malawiTime) {
    malawiTime.textContent = getMalawiDateParts().timeDisplay;
  }
}

function renderPrayerTimes() {
  if (!prayerTimeList) {
    return;
  }

  const { timeKey } = getMalawiDateParts();
  const nextPrayer =
    latestPrayerTimes.find((prayer) => prayer.athan >= timeKey) ?? latestPrayerTimes[0];

  prayerTimeList.innerHTML = latestPrayerTimes
    .map(
      (prayer) => `
        <div class="prayer-time-row${nextPrayer?.label === prayer.label ? " is-next" : ""}">
          <span>${prayer.label}</span>
          <strong>${prayer.athan}</strong>
          <strong>${prayer.salah}</strong>
        </div>
      `,
    )
    .join("");
}

function renderJumuahTimes(times) {
  if (!jumuahTimeList) {
    return;
  }

  jumuahTimeList.innerHTML = `
    <div class="jumuah-time-row">
      <strong>${times.adhan}</strong>
      <strong>${times.sunan}</strong>
      <strong>${times.khutbah}</strong>
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

function updateNotificationStatus() {
  if (!notificationButton) {
    return;
  }

  if (!("Notification" in window)) {
    notificationButton.disabled = true;
    return;
  }

  if (Notification.permission === "granted") {
    notificationButton.textContent = "Notifications enabled";
    notificationButton.disabled = true;
    return;
  }

  if (Notification.permission === "denied") {
    notificationButton.textContent = "Notifications blocked";
    notificationButton.disabled = true;
  }
}

function updateActionVisibility() {
  if (!prayerActions) {
    return;
  }

  const notificationsEnabled =
    "Notification" in window && Notification.permission === "granted";

  if (window.noorivaInstall?.isStandaloneApp() && notificationsEnabled) {
    prayerActions.classList.add("prayer-actions-hidden");
    return;
  }

  prayerActions.classList.remove("prayer-actions-hidden");
}

async function registerServiceWorker() {
  await window.noorivaInstall?.registerServiceWorker?.();
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
    const meta = data?.meta;

    latestPrayerTimes = prayers.map((prayer) => ({
      label: prayer.label,
      athan: data?.[prayer.athanKey] ?? "--:--",
      salah: data?.[prayer.salahKey] ?? "--:--",
    }));

    renderPrayerTimes();
    renderJumuahTimes({
      adhan: data?.jumuahTime1 || "--:--",
      sunan: data?.jumuahTime2 || "--:--",
      khutbah: data?.jumuahTime3 || "--:--",
    });
    renderStartTimings(
      startTimings.map((timing) => ({
        label: timing.label,
        time: data?.[timing.key] || "--:--",
      })),
    );

    if (boardLocation && meta) {
      boardLocation.textContent = `${meta.city}, Malawi`;
    }

    if (lastUpdated) {
      lastUpdated.textContent = data?.last_updated ?? "Live source available";
    }

    prayerStatus.textContent = "Prayer times updated.";
  } catch (error) {
    prayerStatus.textContent = "We couldn't refresh the prayer times just now.";
  }
}

function maybeSendPrayerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const { dateKey, timeKey } = getMalawiDateParts();

  latestPrayerTimes.forEach((prayer) => {
    const storageKey = `nooriva-notified-${dateKey}-${prayer.label.toLowerCase()}`;

    if (prayer.athan === timeKey && !localStorage.getItem(storageKey)) {
      new Notification(`${prayer.label} time`, {
        body: `It is now time for ${prayer.label} in Malawi.`,
        icon: "./assets/nooriva-logo-transparent.png",
        badge: "./assets/nooriva-logo-transparent.png",
      });

      localStorage.setItem(storageKey, "true");
    }
  });
}

if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    loadPrayerTimes();
  });
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
      maybeSendPrayerNotification();
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

updateMalawiClock();
updateNotificationStatus();
updateActionVisibility();
registerServiceWorker();
loadPrayerTimes();

window.addEventListener("nooriva:install-available", () => {
  if (downloadAppButton) {
    downloadAppButton.style.display = "inline-flex";
  }
});

window.addEventListener("nooriva:installed", () => {
  if (downloadAppButton) {
    downloadAppButton.style.display = "none";
  }

  updateActionVisibility();
});

setInterval(updateMalawiClock, 1000);
setInterval(maybeSendPrayerNotification, 15000);
setInterval(loadPrayerTimes, 300000);
