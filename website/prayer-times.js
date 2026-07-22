const prayerApiUrl = "/api/prayer-times";
const malawiTimeZone = "Africa/Blantyre";

const prayers = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", label: "Fajr" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", label: "Zuhr" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", label: "Asr" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", label: "Maghrib" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", label: "Esha" },
];

let latestPrayerTimes = [];

const prayerTimeList = document.getElementById("prayer-time-list");
const prayerStatus = document.getElementById("prayer-status");
const lastUpdated = document.getElementById("last-updated");
const malawiTime = document.getElementById("malawi-time");
const boardLocation = document.getElementById("board-location");
const refreshButton = document.getElementById("refresh-prayers");
const notificationButton = document.getElementById("enable-notifications");

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
  if (!malawiTime) {
    return;
  }

  malawiTime.textContent = getMalawiDateParts().timeDisplay;
}

function renderPrayerTimes() {
  if (!prayerTimeList) {
    return;
  }

  const { timeKey } = getMalawiDateParts();
  const nextPrayer =
    latestPrayerTimes.find((prayer) => prayer.time >= timeKey) ?? latestPrayerTimes[0];

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
    return;
  }
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

    if (boardLocation && meta) {
      boardLocation.textContent = `${meta.city}, Malawi`;
    }

    if (lastUpdated) {
      lastUpdated.textContent = data?.last_updated ?? "Live source available";
    }

    prayerStatus.textContent = "Prayer times updated.";
  } catch (error) {
    prayerStatus.textContent = "We couldn’t refresh the prayer times just now.";
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
      return;
    }

    const permission = await Notification.requestPermission();
    updateNotificationStatus();

    if (permission === "granted") {
      maybeSendPrayerNotification();
    }
  });
}

updateMalawiClock();
updateNotificationStatus();
loadPrayerTimes();

setInterval(updateMalawiClock, 1000);
setInterval(maybeSendPrayerNotification, 15000);
setInterval(loadPrayerTimes, 300000);
