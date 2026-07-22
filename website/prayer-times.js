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
const nextPrayerLabel = document.getElementById("next-prayer-label");
const nextPrayerName = document.getElementById("next-prayer-name");
const nextPrayerTime = document.getElementById("next-prayer-time");
const nextPrayerCountdown = document.getElementById("next-prayer-countdown");
const nextPrayerProgressFill = document.getElementById("next-prayer-progress-fill");
const prayerStatus = document.getElementById("prayer-status");
const lastUpdated = document.getElementById("last-updated");
const malawiTime = document.getElementById("malawi-time");
const boardLocation = document.getElementById("board-location");
const refreshButton = document.getElementById("refresh-prayers");
const notificationButton = document.getElementById("enable-notifications");
const downloadAppButton = document.getElementById("download-app");
const prayerActions = document.getElementById("prayer-actions");
const prayerChecklistStorageKey = "nooriva-prayer-checklist";

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
    notificationButton.style.display = "none";
    updateActionVisibility();
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
resetChecklistIfNeeded();
updateNotificationStatus();
updateActionVisibility();
registerServiceWorker();
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
});

setInterval(() => {
  updateMalawiClock();
  resetChecklistIfNeeded();
  if (latestPrayerTimes.length > 0) {
    renderPrayerTimes();
  }
}, 1000);
setInterval(maybeSendPrayerNotification, 15000);
setInterval(loadPrayerTimes, 300000);
