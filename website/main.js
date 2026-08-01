const mainPrayerApiUrl = "/api/prayer-times";
const mainAyahApiBase = "https://api.alquran.cloud/v1";
const mainMalawiTimeZone = "Africa/Blantyre";
const mainTasbeehStorageKey = "nooriva-main-tasbeeh";

const mainPrayerLabel = document.getElementById("main-prayer-label");
const mainPrayerName = document.getElementById("main-prayer-name");
const mainPrayerTime = document.getElementById("main-prayer-time");
const mainNextSalah = document.getElementById("main-next-salah");
const mainPrayerGuidance = document.getElementById("main-prayer-guidance");
const mainPrayerProgress = document.getElementById("main-prayer-progress");
const mainQiblaArrow = document.getElementById("main-qibla-arrow");
const mainQiblaPhone = document.getElementById("main-qibla-phone");
const mainQiblaStatus = document.getElementById("main-qibla-status");
const mainAyahArabic = document.getElementById("main-ayah-arabic");
const mainAyahEnglish = document.getElementById("main-ayah-english");
const mainAyahReference = document.getElementById("main-ayah-reference");
const mainAyahDownload = document.getElementById("main-ayah-download");
const mainAyahCopyStatus = document.getElementById("main-ayah-copy-status");
const mainGreeting = document.getElementById("main-greeting");
const mainHeroNote = document.getElementById("main-hero-note");
const mainNotificationButton = document.getElementById("main-enable-notifications");
const homeInstallStatus = document.getElementById("home-install-status");
const contactForm = document.getElementById("contact-form");
const contactName = document.getElementById("contact-name");
const contactMessage = document.getElementById("contact-message");
const contactStatus = document.getElementById("contact-status");
const mainTasbeehButton = document.getElementById("main-tasbeeh-button");
const mainTasbeehCount = document.getElementById("main-tasbeeh-count");
const mainTasbeehLabel = document.getElementById("main-tasbeeh-label");
const mainAyahCardShell = document.getElementById("main-ayah-card-shell");
const mainDailyChecklist = document.getElementById("main-daily-checklist");
const mainDailyProgressBar = document.getElementById("main-daily-progress-bar");
const mainDailyHeadingCopy = document.getElementById("main-daily-heading-copy");
const mainDailyCaption = document.getElementById("main-daily-caption");
const mainQuranLast = document.getElementById("main-quran-last");
const mainQuranLastMeta = document.getElementById("main-quran-last-meta");
const mainQuranResumePill = document.getElementById("main-quran-resume-pill");
const mainJumuahStrip = document.getElementById("main-jumuah-strip");
const mainJumuahTitle = document.getElementById("main-jumuah-title");
const mainJumuahMeta = document.getElementById("main-jumuah-meta");

const mainPrayers = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", startKey: "fajrStarts", label: "Fajr", endKey: "sunrise" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", startKey: "zawaalEnd", label: "Zuhr", endKey: "asrShafi" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", startKey: "asrShafi", label: "Asr", endKey: "sunset" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", startKey: "sunset", label: "Maghrib", endKey: "eshaStarts" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", startKey: "eshaStarts", label: "Esha", endKey: null },
];
const mainAyahCandidates = [
  "2:152", "2:186", "2:201", "2:286",
  "3:8", "3:139", "3:173",
  "8:2", "8:46",
  "9:51",
  "13:28",
  "14:7",
  "16:18",
  "17:24",
  "20:114",
  "21:87", "21:88",
  "25:74",
  "29:69",
  "33:56",
  "39:53",
  "40:60",
  "50:16",
  "51:56", "51:58",
  "55:13",
  "65:3",
  "73:8",
  "93:3", "93:4", "93:5", "93:11",
  "94:5", "94:6", "94:8",
  "95:4",
  "96:1",
  "97:1",
  "99:7", "99:8",
  "103:1", "103:2", "103:3",
  "108:1", "108:2", "108:3",
  "109:1", "109:6",
  "112:1", "112:2", "112:3", "112:4",
  "113:1", "113:5",
  "114:1", "114:6",
];
const accountSessionStorageKey = "nooriva-account-session";
const mainPrayerChecklistStorageKey = "nooriva-prayer-checklist";
const quranHomeStorageKey = "nooriva-quran-state";
const mainPrayerCacheStorageKey = "nooriva-main-prayer-cache";
const mainAyahCacheStorageKey = "nooriva-main-ayah-cache";
const pushPublicKeyApiUrl = "/api/push-public-key";
const pushSubscribeApiUrl = "/api/push-subscribe";
const contactSubmitUrl = "/api/contact-submit";

let mainPrayerRows = [];
let mainHeading = null;
let mainBearing = null;
let currentAyahOfDay = null;
let mainSession = loadMainSession();
let mainPushPublicKey = "";
let mainSpecialMoments = {};
let mainJumuahTimes = { adhan: "--:--", khutbah: "--:--" };
let mainLastToggledPrayerLabel = "";
let mainLastToggleAt = 0;
let mainLastNotificationMinuteKey = "";
let mainAbsoluteCompassReady = false;
let mainPrayerRefreshIntervalStarted = false;

function loadMainCachedJson(storageKey) {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    return null;
  }
}

function saveMainCachedJson(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function setMainConnectivityStatus(message, isOffline = false) {
  if (!homeInstallStatus) {
    return;
  }

  homeInstallStatus.textContent = message;
  homeInstallStatus.classList.toggle("is-offline", Boolean(isOffline));
}

function getMainMalawiParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: mainMalawiTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    timeKey: `${values.hour}:${values.minute}`,
    secondKey: values.second,
    weekday: new Intl.DateTimeFormat("en-US", { timeZone: mainMalawiTimeZone, weekday: "long" }).format(new Date()),
  };
}

function getMainMinutes(value) {
  const [hours, minutes] = String(value || "")
    .split(":")
    .map((part) => Number.parseInt(part, 10));

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatHoursAndMinutes(totalMinutes) {
  const safeMinutes = Math.max(totalMinutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

function loadQuranHomeState() {
  try {
    return JSON.parse(localStorage.getItem(quranHomeStorageKey) || "null");
  } catch {
    return null;
  }
}

function getMainPrayerWindows() {
  return mainPrayerRows.map((prayer, index) => {
    const startMinutes = getMainMinutes(prayer.startTime) ?? getMainMinutes(prayer.salah) ?? getMainMinutes(prayer.athan) ?? 0;
    let endMinutes = getMainMinutes(prayer.endTime);

    if (endMinutes === null) {
      endMinutes =
        index < mainPrayerRows.length - 1
          ? getMainMinutes(mainPrayerRows[index + 1]?.startTime) ?? getMainMinutes(mainPrayerRows[index + 1]?.salah) ?? getMainMinutes(mainPrayerRows[index + 1]?.athan)
          : getMainMinutes(mainPrayerRows[0]?.startTime) ?? getMainMinutes(mainPrayerRows[0]?.salah) ?? getMainMinutes(mainPrayerRows[0]?.athan);
    }

    if (endMinutes === null) {
      endMinutes = 24 * 60;
    }

    return {
      ...prayer,
      startMinutes,
      endMinutes,
    };
  });
}

function getCurrentMainSalahLabel() {
  if (!mainPrayerRows.length) {
    return null;
  }

  const windows = getMainPrayerWindows();
  const { timeKey } = getMainMalawiParts();
  const currentMinutes = getMainMinutes(timeKey) ?? 0;

  const currentPrayer =
    windows.find((prayer) => {
      const adjustedCurrentMinutes =
        prayer.endMinutes !== null && prayer.endMinutes <= prayer.startMinutes && currentMinutes < prayer.startMinutes
          ? currentMinutes + 24 * 60
          : currentMinutes;
      const wrapsMidnight = prayer.endMinutes <= prayer.startMinutes || prayer.endMinutes > 24 * 60;

      if (wrapsMidnight) {
        return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
      }

      return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
    }) ?? null;

  return currentPrayer?.label ?? null;
}

function getChecklistHighlightMainSalahLabel() {
  if (!mainPrayerRows.length) {
    return null;
  }

  const windows = getMainPrayerWindows();
  const { timeKey } = getMainMalawiParts();
  const currentMinutes = getMainMinutes(timeKey) ?? 0;

  const currentPrayer =
    windows.find((prayer) => {
      const adjustedCurrentMinutes =
        prayer.endMinutes !== null && prayer.endMinutes <= prayer.startMinutes && currentMinutes < prayer.startMinutes
          ? currentMinutes + 24 * 60
          : currentMinutes;
      const wrapsMidnight = prayer.endMinutes <= prayer.startMinutes || prayer.endMinutes > 24 * 60;

      if (wrapsMidnight) {
        return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
      }

      return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
    }) ?? null;

  if (currentPrayer) {
    return { label: currentPrayer.label, state: "current" };
  }

  const nextPrayer =
    windows
      .map((prayer) => ({
        ...prayer,
        effectiveStart: prayer.startMinutes > currentMinutes ? prayer.startMinutes : prayer.startMinutes + 24 * 60,
      }))
      .sort((a, b) => a.effectiveStart - b.effectiveStart)[0] ?? null;

  return nextPrayer ? { label: nextPrayer.label, state: "next" } : null;
}

function toggleMainChecklistPrayer(prayerLabel) {
  const current = getMainChecklistState();
  const nextChecked = !Boolean(current.checked?.[prayerLabel]);
  current.checked[prayerLabel] = nextChecked;
  mainLastToggledPrayerLabel = prayerLabel;
  mainLastToggleAt = Date.now();
  saveMainChecklistState(current.checked);
  renderMainDailyChecklist();
}

function loadMainSession() {
  try {
    return JSON.parse(localStorage.getItem(accountSessionStorageKey) || "null");
  } catch {
    return null;
  }
}

function saveMainSession(session) {
  localStorage.setItem(accountSessionStorageKey, JSON.stringify(session));
  mainSession = session;
}

function getMainChecklistState() {
  const { dateKey } = getMainMalawiParts();
  const raw = localStorage.getItem(mainPrayerChecklistStorageKey);

  if (!raw) {
    return { dateKey, checked: {} };
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.dateKey !== dateKey) {
      return { dateKey, checked: {} };
    }

    return { dateKey, checked: parsed.checked ?? {} };
  } catch {
    return { dateKey, checked: {} };
  }
}

function saveMainChecklistState(checked) {
  const { dateKey } = getMainMalawiParts();
  localStorage.setItem(
    mainPrayerChecklistStorageKey,
    JSON.stringify({
      dateKey,
      checked,
    }),
  );
}

function renderMainDailyChecklist() {
  if (!mainDailyChecklist) {
    return;
  }

  const checklist = getMainChecklistState();
  const highlightPrayer = getChecklistHighlightMainSalahLabel();
  const checkedCount = mainPrayers.filter((prayer) => Boolean(checklist.checked?.[prayer.label])).length;
  const now = Date.now();

  mainDailyChecklist.innerHTML = mainPrayers
    .map((prayer) => {
      const isChecked = Boolean(checklist.checked?.[prayer.label]);
      const isCurrent = highlightPrayer?.label === prayer.label && highlightPrayer?.state === "current";
      const isNext = highlightPrayer?.label === prayer.label && highlightPrayer?.state === "next";
      const isToggling = mainLastToggledPrayerLabel === prayer.label && now - mainLastToggleAt < 700;
      return `
        <div class="main-daily-item${isChecked ? " is-checked" : ""}${isCurrent ? " is-current" : ""}${isNext ? " is-next" : ""}${isToggling ? " is-toggling" : ""}">
          <div class="main-daily-name-wrap">
            <button
              class="main-daily-name"
              type="button"
              data-main-prayer-check="${prayer.label}"
              aria-pressed="${isChecked ? "true" : "false"}"
              aria-label="Mark ${prayer.label} as ${isChecked ? "not completed" : "completed"}"
            >☾ ${prayer.label}</button>
          </div>
          <button
            class="main-daily-tick-button"
            type="button"
            data-main-prayer-check="${prayer.label}"
            aria-pressed="${isChecked ? "true" : "false"}"
            aria-label="Mark ${prayer.label} as ${isChecked ? "not completed" : "completed"}"
          >
            <span class="main-daily-tick" aria-hidden="true"></span>
          </button>
        </div>
      `;
    })
    .join("");

  if (mainDailyProgressBar) {
    const progress = Math.max(0, Math.min((checkedCount / mainPrayers.length) * 100, 100));
    mainDailyProgressBar.style.width = `${progress}%`;
  }

  if (mainDailyHeadingCopy) {
    mainDailyHeadingCopy.textContent =
      checkedCount === mainPrayers.length
        ? "All 5 salah completed"
        : checkedCount > 0
          ? `${checkedCount} of 5 salah completed`
          : "Track all 5 salah";
  }

  if (mainDailyCaption) {
    mainDailyCaption.textContent =
      checkedCount === mainPrayers.length
        ? "Beautiful — today’s prayers are complete."
        : checkedCount > 0
          ? `${mainPrayers.length - checkedCount} prayer${mainPrayers.length - checkedCount === 1 ? "" : "s"} left for today.`
          : "A simple check-in for your five prayers.";
  }

  mainDailyChecklist.querySelectorAll("[data-main-prayer-check]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMainChecklistPrayer(button.dataset.mainPrayerCheck);
    });
  });
}

function renderMainGreeting() {
  const name = mainSession?.user?.fullName?.trim();
  const salaam = "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064a\u0643\u0645";

  if (mainGreeting) {
    mainGreeting.textContent = name ? `${salaam} ${name}` : salaam;
  }

  if (mainHeroNote) {
    const { weekday } = getMainMalawiParts();
    mainHeroNote.textContent =
      weekday === "Friday"
        ? "May Allah accept your Jumu'ah and fill your day with barakah."
        : weekday === "Monday"
          ? "A new week begins gently — start with salah and one good intention."
          : "May Allah put barakah in your day.";
  }
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

async function loadMainPushPublicKey() {
  try {
    const response = await fetch(pushPublicKeyApiUrl, { cache: "no-store" });
    const payload = await response.json();
    mainPushPublicKey = payload?.publicKey ?? "";
  } catch {
    mainPushPublicKey = "";
  }
}

async function enableMainNotifications() {
  if (!("Notification" in window)) return;
  await window.noorivaInstall?.registerServiceWorker?.();
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;
  await loadMainPushPublicKey();
  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration || !mainPushPublicKey) return;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(mainPushPublicKey),
    });
  }
  await fetch(pushSubscribeApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  }).catch(() => undefined);
  if (mainNotificationButton) {
    mainNotificationButton.style.display = "none";
  }
}

if ("Notification" in window && Notification.permission === "granted") {
  enableMainNotifications().catch(() => undefined);
}

function updateMainNotificationButton() {
  if (!mainNotificationButton || !("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    mainNotificationButton.style.display = "none";
  } else if (Notification.permission === "denied") {
    mainNotificationButton.textContent = "Notifications blocked";
    mainNotificationButton.disabled = true;
  }
}

function buildMainActivityEntries() {
  const windows = getMainPrayerWindows();
  const activities = windows.map((entry) => {
    let startMinutes = entry.startMinutes;
    let endMinutes = entry.endMinutes;

    if (endMinutes !== null && endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    return {
      label: entry.label,
      time: entry.salah,
      displayTime: entry.salah,
      athan: entry.athan,
      salah: entry.salah,
      startTime: entry.startTime,
      adhanMinutes: getMainMinutes(entry.athan),
      startMinutes,
      endMinutes,
      kind: "prayer",
    };
  });

  const sunrise = getMainMinutes(mainSpecialMoments.sunrise);
  const sunset = getMainMinutes(mainSpecialMoments.sunset);
  const istiwa = getMainMinutes(mainSpecialMoments.istiwa);
  const zawaalEnd = getMainMinutes(mainSpecialMoments.zawaalEnd);

  if (sunrise !== null) {
    activities.push({ label: "Sunrise", time: mainSpecialMoments.sunrise, displayTime: mainSpecialMoments.sunrise, startMinutes: sunrise, endMinutes: sunrise + 20, kind: "special" });
  }
  if (istiwa !== null && zawaalEnd !== null && zawaalEnd > istiwa) {
    activities.push({ label: "Zawwal", time: mainSpecialMoments.istiwa, displayTime: mainSpecialMoments.istiwa, startMinutes: istiwa, endMinutes: zawaalEnd, kind: "special" });
  }
  if (sunset !== null) {
    activities.push({ label: "Sunset", time: mainSpecialMoments.sunset, displayTime: mainSpecialMoments.sunset, startMinutes: sunset, endMinutes: sunset + 20, kind: "special" });
  }

  return activities.sort((a, b) => a.startMinutes - b.startMinutes);
}



function renderMainPrayer() {
  if (!mainPrayerRows.length) return;

  const windows = buildMainActivityEntries();
  const { timeKey } = getMainMalawiParts();
  const currentMinutes = getMainMinutes(timeKey) ?? 0;

  const currentPrayer =
    windows.find((prayer) => {
      const adjustedCurrentMinutes =
        prayer.endMinutes !== null && prayer.endMinutes <= prayer.startMinutes && currentMinutes < prayer.startMinutes
          ? currentMinutes + 24 * 60
          : currentMinutes;
      const wrapsMidnight = prayer.endMinutes <= prayer.startMinutes || prayer.endMinutes > 24 * 60;

      if (wrapsMidnight) {
        return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
      }

      return adjustedCurrentMinutes >= prayer.startMinutes && adjustedCurrentMinutes < prayer.endMinutes;
    }) ?? null;

  const nextPrayer =
    windows
      .map((prayer) => ({
        ...prayer,
        effectiveStart: prayer.startMinutes > currentMinutes ? prayer.startMinutes : prayer.startMinutes + 24 * 60,
      }))
      .sort((a, b) => a.effectiveStart - b.effectiveStart)[0] ?? null;

  const nextPrayerMinutes = nextPrayer?.effectiveStart ?? currentMinutes;
  const nextAdhan =
    windows
      .filter((prayer) => prayer.kind === "prayer")
      .map((prayer) => ({
        ...prayer,
        effectiveAthan:
          (prayer.adhanMinutes ?? 0) > currentMinutes
            ? prayer.adhanMinutes ?? 0
            : (prayer.adhanMinutes ?? 0) + 24 * 60,
      }))
      .sort((a, b) => a.effectiveAthan - b.effectiveAthan)[0] ?? null;
  const nextAdhanMinutes = nextAdhan?.effectiveAthan ?? currentMinutes;
  const currentAdhanMinutes =
    currentPrayer?.kind === "prayer" && currentPrayer?.adhanMinutes !== null && currentPrayer?.adhanMinutes !== undefined
      ? (currentPrayer.adhanMinutes > currentMinutes
          ? currentPrayer.adhanMinutes
          : currentPrayer.adhanMinutes + 24 * 60)
      : null;

  if (mainPrayerLabel) {
    mainPrayerLabel.textContent = currentPrayer ? "Active now" : "Next";
  }

  if (mainPrayerName) {
    mainPrayerName.textContent = currentPrayer?.label ?? nextPrayer?.label ?? "Prayer";
  }

  if (mainPrayerTime) {
    if (currentPrayer?.kind === "prayer") {
      mainPrayerTime.textContent = `Salah ${currentPrayer.displayTime ?? "--:--"}`;
    } else if (currentPrayer) {
      mainPrayerTime.textContent = currentPrayer.displayTime ?? "--:--";
    } else {
      mainPrayerTime.textContent = nextPrayer?.kind === "prayer"
        ? `Salah ${nextPrayer?.displayTime ?? "--:--"}`
        : nextPrayer?.displayTime ?? "--:--";
    }
  }

  if (mainNextSalah) {
    const minutesUntilNextSalah = nextPrayerMinutes - currentMinutes;
    const minutesUntilAdhan = nextAdhanMinutes - currentMinutes;
    mainNextSalah.textContent = currentPrayer
      ? `Next adhan · ${nextAdhan?.label ?? "--"} · ${nextAdhan?.athan ?? "--:--"} · ${formatHoursAndMinutes(minutesUntilAdhan)}`
      : `Next salah · ${nextPrayer?.label ?? "--"} · ${nextPrayer?.displayTime ?? "--:--"} · ${formatHoursAndMinutes(minutesUntilNextSalah)}`;
  }

  if (mainPrayerGuidance) {
    if (currentPrayer?.kind === "prayer") {
      mainPrayerGuidance.textContent = `${currentPrayer.label} is active now. Turn to Allah before the window passes.`;
    } else if (currentPrayer) {
      mainPrayerGuidance.textContent = `${currentPrayer.label} is active now. Stay aware of the next salah.`;
    } else if (nextPrayer?.label) {
      mainPrayerGuidance.textContent = `Prepare for ${nextPrayer.label} with wudhu, calm, and intention.`;
    } else {
      mainPrayerGuidance.textContent = "Stay close to your prayer times today.";
    }
  }

  if (mainPrayerProgress) {
    if (currentPrayer?.kind === "prayer" && currentAdhanMinutes) {
      const adhanWait = Math.max(currentAdhanMinutes - currentMinutes, 0);
      const totalAdhanWindow = Math.max(currentAdhanMinutes - currentPrayer.startMinutes, 1);
      const elapsedToAdhan = Math.min(Math.max(currentMinutes - currentPrayer.startMinutes, 0), totalAdhanWindow);
      const progress = adhanWait <= 0 ? 100 : Math.max(8, Math.min((elapsedToAdhan / totalAdhanWindow) * 100, 100));
      mainPrayerProgress.style.width = `${progress}%`;
    } else if (currentPrayer) {
      const windowLength = Math.max(currentPrayer.endMinutes - currentPrayer.startMinutes, 1);
      const elapsed = Math.min(Math.max(currentMinutes - currentPrayer.startMinutes, 0), windowLength);
      mainPrayerProgress.style.width = `${Math.max(8, Math.min((elapsed / windowLength) * 100, 100))}%`;
    } else {
      mainPrayerProgress.style.width = "0%";
    }
  }

  const prayerBanner = document.querySelector(".main-prayer-banner");
  prayerBanner?.classList.toggle("is-active", Boolean(currentPrayer));
}

async function loadMainPrayer() {
  try {
    const response = await fetch(mainPrayerApiUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Prayer API returned ${response.status}`);
    }
    const payload = await response.json();
    const data = payload?.data ?? {};

    saveMainCachedJson(mainPrayerCacheStorageKey, {
      savedAt: Date.now(),
      data,
    });

    mainPrayerRows = mainPrayers.map((prayer) => ({
      label: prayer.label,
      athan: data?.[prayer.athanKey] ?? "--:--",
      salah: data?.[prayer.salahKey] ?? "--:--",
      startTime: data?.[prayer.startKey] ?? data?.[prayer.salahKey] ?? "--:--",
      endTime: prayer.endKey ? data?.[prayer.endKey] ?? "--:--" : "--:--",
    }));
    mainSpecialMoments = {
      sunrise: data?.sunrise ?? "--:--",
      sunset: data?.sunset ?? "--:--",
      istiwa: data?.istiwa ?? "--:--",
      zawaalEnd: data?.zawaalEnd ?? "--:--",
    };
    mainJumuahTimes = {
      adhan: data?.jumuahTime1 ?? "--:--",
      khutbah: data?.jumuahTime3 ?? "--:--",
    };

    renderMainPrayer();
    renderMainDailyChecklist();
    renderMainJumuah();
    setMainConnectivityStatus("Ready.");
    if (!mainPrayerRefreshIntervalStarted) {
      window.setInterval(renderMainPrayer, 60000);
      mainPrayerRefreshIntervalStarted = true;
    }
  } catch {
    const cached = loadMainCachedJson(mainPrayerCacheStorageKey);
    const data = cached?.data ?? null;

    if (data) {
      mainPrayerRows = mainPrayers.map((prayer) => ({
        label: prayer.label,
        athan: data?.[prayer.athanKey] ?? "--:--",
        salah: data?.[prayer.salahKey] ?? "--:--",
        startTime: data?.[prayer.startKey] ?? data?.[prayer.salahKey] ?? "--:--",
        endTime: prayer.endKey ? data?.[prayer.endKey] ?? "--:--" : "--:--",
      }));
      mainSpecialMoments = {
        sunrise: data?.sunrise ?? "--:--",
        sunset: data?.sunset ?? "--:--",
        istiwa: data?.istiwa ?? "--:--",
        zawaalEnd: data?.zawaalEnd ?? "--:--",
      };
      mainJumuahTimes = {
        adhan: data?.jumuahTime1 ?? "--:--",
        khutbah: data?.jumuahTime3 ?? "--:--",
      };
      renderMainPrayer();
      renderMainDailyChecklist();
      renderMainJumuah();
      setMainConnectivityStatus("Offline. Showing saved prayer times.", true);
      return;
    }

    if (mainPrayerName) mainPrayerName.textContent = "Prayer unavailable";
    if (mainPrayerTime) mainPrayerTime.textContent = "--:--";
    if (mainNextSalah) mainNextSalah.textContent = "Next salah unavailable";
    setMainConnectivityStatus("Offline. Connect once to load your prayer data.", true);
  }
}

function renderMainJumuah() {
  if (!mainJumuahStrip || !mainJumuahMeta || !mainJumuahTitle) {
    return;
  }

  const { weekday } = getMainMalawiParts();
  const isFriday = weekday === "Friday";
  mainJumuahStrip.hidden = !isFriday;
  mainJumuahStrip.setAttribute("aria-hidden", String(!isFriday));

  if (!isFriday) {
    mainJumuahTitle.textContent = "Jumu'ah";
    mainJumuahMeta.textContent = "";
    return;
  }

  mainJumuahTitle.textContent = "Jumu'ah today";
  mainJumuahMeta.textContent = `Adhan ${mainJumuahTimes.adhan} · Khutbah ${mainJumuahTimes.khutbah}`;
}

function getAyahReferenceForToday() {
  const { dateKey } = getMainMalawiParts();
  let seed = 0;

  for (const character of dateKey) {
    seed = (seed * 31 + character.charCodeAt(0)) % mainAyahCandidates.length;
  }

  return mainAyahCandidates[seed % mainAyahCandidates.length];
}

async function loadMainAyah() {
  try {
    const ayahReference = getAyahReferenceForToday();
    const response = await fetch(`${mainAyahApiBase}/ayah/${ayahReference}/editions/quran-uthmani,en.sahih`, {
      cache: "force-cache",
    });
    const payload = await response.json();
    const [arabic, english] = payload?.data ?? [];

    const normalizeAyahFlowText = (value) =>
      String(value ?? "—")
        .replace(/\s*\n+\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    currentAyahOfDay = {
      surahName: english?.surah?.englishName ?? arabic?.surah?.englishName ?? "Quran",
      ayahInSurah: english?.numberInSurah ?? arabic?.numberInSurah ?? "",
      arabic: normalizeAyahFlowText(arabic?.text),
      english: normalizeAyahFlowText(english?.text),
    };

    saveMainCachedJson(mainAyahCacheStorageKey, {
      dateKey: getMainMalawiParts().dateKey,
      ayah: currentAyahOfDay,
    });

    if (mainAyahArabic) mainAyahArabic.textContent = currentAyahOfDay.arabic;
    if (mainAyahEnglish) mainAyahEnglish.textContent = currentAyahOfDay.english;
    if (mainAyahReference) {
      mainAyahReference.textContent = `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`;
    }
    if (mainAyahCopyStatus) {
      mainAyahCopyStatus.textContent = "";
    }
    fitAyahCardText();
  } catch {
    const cached = loadMainCachedJson(mainAyahCacheStorageKey);
    if (cached?.ayah) {
      currentAyahOfDay = cached.ayah;
      if (mainAyahArabic) mainAyahArabic.textContent = currentAyahOfDay.arabic ?? "—";
      if (mainAyahEnglish) mainAyahEnglish.textContent = currentAyahOfDay.english ?? "Ayah unavailable right now.";
      if (mainAyahReference) {
        mainAyahReference.textContent = `${currentAyahOfDay.surahName ?? "Quran"} ${currentAyahOfDay.ayahInSurah ?? ""}`.trim();
      }
      if (mainAyahCopyStatus) {
        mainAyahCopyStatus.textContent = "Offline copy ready.";
      }
      fitAyahCardText();
      return;
    }

    if (mainAyahEnglish) mainAyahEnglish.textContent = "Ayah unavailable right now.";
  }
}

function fitElementText(element, { min, max, step = 1, lineHeight }) {
  if (!element) {
    return;
  }

  let size = max;
  element.style.fontSize = `${size}px`;
  if (lineHeight) {
    element.style.lineHeight = String(lineHeight);
  }

  while (size > min && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
    size -= step;
    element.style.fontSize = `${size}px`;
  }
}

function fitAyahCardText() {
  if (!mainAyahArabic || !mainAyahEnglish) {
    return;
  }

  fitElementText(mainAyahArabic, { min: 20, max: 29, step: 1, lineHeight: 1.62 });
  fitElementText(mainAyahEnglish, { min: 11, max: 15, step: 0.5, lineHeight: 1.5 });
}

async function copyMainAyah() {
  if (!currentAyahOfDay) {
    return;
  }

  const text = `${currentAyahOfDay.arabic}\n\n${currentAyahOfDay.english}\n\n${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`;

  try {
    await navigator.clipboard.writeText(text);
    if (mainAyahCopyStatus) {
      mainAyahCopyStatus.textContent = "Copied";
      window.setTimeout(() => {
        if (mainAyahCopyStatus.textContent === "Copied") {
          mainAyahCopyStatus.textContent = "";
        }
      }, 1800);
    }
  } catch {
    if (mainAyahCopyStatus) {
      mainAyahCopyStatus.textContent = "Copy failed";
    }
  }
}

async function loadMainQuranLastReading() {
  const state = loadQuranHomeState();
  const surahKey = String(state?.lastReading?.surahKey || state?.selectedKey || "1");
  const page = Math.max(1, Number(state?.lastReading?.page || state?.currentPage || 1));
  const bothChunkIndex = Math.max(0, Number(state?.bothChunkIndex || 0));

  try {
    const [surahResponse, pageResponse] = await Promise.all([
      fetch(`${mainAyahApiBase}/surah/${surahKey}`, { cache: "force-cache" }),
      fetch(`${mainAyahApiBase}/page/${page}/quran-uthmani`, { cache: "force-cache" }),
    ]);

    const surahPayload = await surahResponse.json();
    const pagePayload = await pageResponse.json();
    const surahName = surahPayload?.data?.englishName ?? `Surah ${surahKey}`;
    const ayahs = pagePayload?.data?.ayahs ?? [];
    const targetAyah = ayahs[Math.min(bothChunkIndex * 3, Math.max(ayahs.length - 1, 0))];
    const ayahNumber = targetAyah?.numberInSurah ?? 1;

    if (mainQuranLast) {
      mainQuranLast.textContent = surahName;
    }

    if (mainQuranLastMeta) {
      mainQuranLastMeta.textContent = `Ayah ${ayahNumber} · Page ${page}`;
    }
  } catch {
    if (mainQuranLast) {
      mainQuranLast.textContent = "Continue reading";
    }

    if (mainQuranLastMeta) {
      mainQuranLastMeta.textContent = "Open your reading and continue where you left off.";
    }
  }
}

function sanitizeFileNamePart(value) {
  return String(value || "Quran").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function assetToDataUrl(assetUrl) {
  const response = await fetch(assetUrl);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildInlineStyle(computedStyle, extra = {}) {
  const styleMap = {
    position: extra.position ?? "absolute",
    left: extra.left ?? "0px",
    top: extra.top ?? "0px",
    width: extra.width ?? computedStyle.width,
    height: extra.height ?? computedStyle.height,
    display: extra.display ?? computedStyle.display,
    alignItems: extra.alignItems ?? computedStyle.alignItems,
    justifyContent: extra.justifyContent ?? computedStyle.justifyContent,
    flexDirection: extra.flexDirection ?? computedStyle.flexDirection,
    gap: extra.gap ?? computedStyle.gap,
    padding: extra.padding ?? computedStyle.padding,
    paddingTop: extra.paddingTop ?? computedStyle.paddingTop,
    paddingBottom: extra.paddingBottom ?? computedStyle.paddingBottom,
    margin: extra.margin ?? computedStyle.margin,
    fontFamily: extra.fontFamily ?? computedStyle.fontFamily,
    fontSize: extra.fontSize ?? computedStyle.fontSize,
    fontWeight: extra.fontWeight ?? computedStyle.fontWeight,
    lineHeight: extra.lineHeight ?? computedStyle.lineHeight,
    letterSpacing: extra.letterSpacing ?? computedStyle.letterSpacing,
    color: extra.color ?? computedStyle.color,
    textAlign: extra.textAlign ?? computedStyle.textAlign,
    direction: extra.direction ?? computedStyle.direction,
    whiteSpace: extra.whiteSpace ?? computedStyle.whiteSpace,
    overflowWrap: extra.overflowWrap ?? computedStyle.overflowWrap,
    wordBreak: extra.wordBreak ?? computedStyle.wordBreak,
    textWrap: extra.textWrap ?? computedStyle.textWrap,
    overflow: extra.overflow ?? computedStyle.overflow,
    borderRadius: extra.borderRadius ?? computedStyle.borderRadius,
    boxSizing: extra.boxSizing ?? computedStyle.boxSizing,
    background: extra.background ?? computedStyle.background,
    transform: extra.transform ?? computedStyle.transform,
  };

  return Object.entries(styleMap)
    .filter(([, currentValue]) => currentValue && currentValue !== "normal" && currentValue !== "none")
    .map(([key, currentValue]) => `${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${currentValue}`)
    .join(";");
}

function getElementBoxRatios(element, container) {
  if (!element || !container) {
    return null;
  }

  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  return {
    left: (elementRect.left - containerRect.left) / containerRect.width,
    top: (elementRect.top - containerRect.top) / containerRect.height,
    width: elementRect.width / containerRect.width,
    height: elementRect.height / containerRect.height,
  };
}

function wrapCanvasText(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(testLine).width <= maxWidth || !currentLine) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawCenteredLines(context, lines, x, startY, lineHeight) {
  lines.forEach((line, index) => {
    context.fillText(line, x, startY + index * lineHeight);
  });
}

function getBestCanvasTextLayout(context, text, options) {
  const { maxFontSize, minFontSize, width, maxHeight, lineHeightRatio } = options;

  for (let size = maxFontSize; size >= minFontSize; size -= 1) {
    context.font = `${options.weight} ${size}px ${options.family}`;
    const lines = wrapCanvasText(context, text, width);
    const lineHeight = size * lineHeightRatio;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= maxHeight) {
      return { size, lines, lineHeight, totalHeight };
    }
  }

  context.font = `${options.weight} ${minFontSize}px ${options.family}`;
  const lines = wrapCanvasText(context, text, width);
  const lineHeight = minFontSize * lineHeightRatio;
  return { size: minFontSize, lines, lineHeight, totalHeight: lines.length * lineHeight };
}

function downloadAyahCard() {
  if (!currentAyahOfDay) {
    return;
  }

  const preview = mainAyahCardShell;
  const art = preview?.querySelector(".main-ayah-card-art");
  const inner = preview?.querySelector(".main-ayah-card-inner");
  const content = preview?.querySelector(".main-ayah-content");
  const tallVariant = preview?.dataset.cardVariant === "tall";

  if (!preview || !art || !inner || !content || !mainAyahArabic || !mainAyahEnglish || !mainAyahReference) {
    return;
  }

  mainAyahDownload.disabled = true;

  (async () => {
    try {
      const backgroundAsset = tallVariant ? "./assets/ayah-card-template-tall.png" : "./assets/ayah-card-template.jpeg";
      const backgroundDataUrl = await assetToDataUrl(backgroundAsset);

      const artRect = art.getBoundingClientRect();
      const innerRect = inner.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const arabicRect = mainAyahArabic.getBoundingClientRect();
      const englishRect = mainAyahEnglish.getBoundingClientRect();
      const referenceRect = mainAyahReference.getBoundingClientRect();

      const exportWidth = Math.max(1200, Math.round(artRect.width * (tallVariant ? 2.1 : 2.35)));
      const exportHeight = Math.round(exportWidth * (artRect.height / Math.max(artRect.width, 1)));

      const artStyle = window.getComputedStyle(art);
      const innerStyle = window.getComputedStyle(inner);
      const contentStyle = window.getComputedStyle(content);
      const arabicStyle = window.getComputedStyle(mainAyahArabic);
      const englishStyle = window.getComputedStyle(mainAyahEnglish);
      const referenceStyle = window.getComputedStyle(mainAyahReference);

      const svgMarkup = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="0 0 ${artRect.width} ${artRect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${artRect.width}px;height:${artRect.height}px;overflow:hidden;border-radius:${artStyle.borderRadius};box-sizing:border-box;background-image:url('${backgroundDataUrl}');background-size:cover;background-position:center;background-repeat:no-repeat;">
              <div style="${buildInlineStyle(innerStyle, {
                left: `${innerRect.left - artRect.left}px`,
                top: `${innerRect.top - artRect.top}px`,
                width: `${innerRect.width}px`,
                height: `${innerRect.height}px`,
              })}">
                <div style="${buildInlineStyle(contentStyle, {
                  left: `${contentRect.left - artRect.left}px`,
                  top: `${contentRect.top - artRect.top}px`,
                  width: `${contentRect.width}px`,
                  height: `${contentRect.height}px`,
                  paddingTop: contentStyle.paddingTop,
                  paddingBottom: contentStyle.paddingBottom,
                })}">
                  <p style="${buildInlineStyle(arabicStyle, {
                    left: `${arabicRect.left - artRect.left}px`,
                    top: `${arabicRect.top - artRect.top}px`,
                    width: `${arabicRect.width}px`,
                    height: `${arabicRect.height}px`,
                    margin: "0",
                    display: "block",
                    whiteSpace: "pre-wrap",
                  })}">${escapeHtml(mainAyahArabic.textContent || "")}</p>
                  <p style="${buildInlineStyle(englishStyle, {
                    left: `${englishRect.left - artRect.left}px`,
                    top: `${englishRect.top - artRect.top}px`,
                    width: `${englishRect.width}px`,
                    height: `${englishRect.height}px`,
                    margin: "0",
                    display: "block",
                    whiteSpace: "pre-wrap",
                  })}">${escapeHtml(mainAyahEnglish.textContent || "")}</p>
                </div>
                <p style="${buildInlineStyle(referenceStyle, {
                  left: `${referenceRect.left - artRect.left}px`,
                  top: `${referenceRect.top - artRect.top}px`,
                  width: `${referenceRect.width}px`,
                  height: `${referenceRect.height}px`,
                  margin: "0",
                  display: "block",
                  whiteSpace: "pre-wrap",
                })}">${escapeHtml(mainAyahReference.textContent || "")}</p>
              </div>
            </div>
          </foreignObject>
        </svg>
      `;

      const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(svgUrl);
          mainAyahDownload.disabled = false;
          return;
        }

        context.drawImage(image, 0, 0, exportWidth, exportHeight);
        URL.revokeObjectURL(svgUrl);

        canvas.toBlob((blob) => {
          mainAyahDownload.disabled = false;
          if (!blob) {
            return;
          }

          const link = document.createElement("a");
          const fileName = `${sanitizeFileNamePart(currentAyahOfDay.surahName)}-${sanitizeFileNamePart(currentAyahOfDay.ayahInSurah)}.png`;
          const objectUrl = URL.createObjectURL(blob);
          link.href = objectUrl;
          link.download = fileName;
          link.click();
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }, "image/png");
      };

      image.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        mainAyahDownload.disabled = false;
      };

      image.src = svgUrl;
    } catch {
      mainAyahDownload.disabled = false;
    }
  })();
}

function getMainTasbeehState() {
  const { dateKey } = getMainMalawiParts();

  try {
    const raw = localStorage.getItem(mainTasbeehStorageKey);
    if (!raw) return { dateKey, count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed?.dateKey !== dateKey) return { dateKey, count: 0 };
    return { dateKey, count: Number(parsed?.count) || 0 };
  } catch {
    return { dateKey, count: 0 };
  }
}

function saveMainTasbeehState(state) {
  localStorage.setItem(mainTasbeehStorageKey, JSON.stringify(state));
}

function renderMainTasbeeh() {
  const state = getMainTasbeehState();
  if (mainTasbeehCount) mainTasbeehCount.textContent = String(state.count);
  if (mainTasbeehLabel) mainTasbeehLabel.textContent = "Today";
}

async function showMainPrayerNotification(prayer) {
  const title = `${prayer.label} time`;
  const body =
    "The Messenger of Allah (ﷺ) said: ‘The covenant that distinguishes between us and them is prayer; so whoever leaves it, he has committed Kufr.’";

  try {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: "./assets/icon-192.png",
        badge: "./assets/favicon-32.png",
        tag: `nooriva-main-adhan-${prayer.label.toLowerCase()}`,
        renotify: true,
        data: {
          url: "/prayer.html",
        },
      });
      return true;
    }
  } catch {
    // fall through to Notification API
  }

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "./assets/icon-192.png",
      badge: "./assets/favicon-32.png",
      tag: `nooriva-main-adhan-${prayer.label.toLowerCase()}`,
    });
    return true;
  }

  return false;
}

async function maybeSendMainPrayerNotification() {
  if (!("Notification" in window) || Notification.permission !== "granted" || !mainPrayerRows.length) {
    return;
  }

  const { dateKey, timeKey, secondKey } = getMainMalawiParts();
  const minuteKey = `${dateKey}:${timeKey}`;

  if (mainLastNotificationMinuteKey === minuteKey || secondKey !== "00") {
    return;
  }

  mainLastNotificationMinuteKey = minuteKey;

  for (const prayer of mainPrayerRows) {
    const storageKey = `nooriva-notified-${dateKey}-${prayer.label.toLowerCase()}`;
    if (prayer.athan === timeKey && !localStorage.getItem(storageKey)) {
      const shown = await showMainPrayerNotification(prayer);
      if (shown) {
        localStorage.setItem(storageKey, "true");
      }
    }
  }
}

function setupMainTasbeeh() {
  renderMainTasbeehEnhanced();

  mainTasbeehButton?.addEventListener("click", () => {
    const state = getMainTasbeehState();
    state.count += 1;
    saveMainTasbeehState(state);
    renderMainTasbeehEnhanced();
    mainTasbeehButton.classList.add("is-tapping");
    window.setTimeout(() => mainTasbeehButton.classList.remove("is-tapping"), 140);
  });
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateMainQiblaBearing(latitude, longitude) {
  const kaabaLat = toRadians(21.4225);
  const kaabaLon = toRadians(39.8262);
  const userLat = toRadians(latitude);
  const userLon = toRadians(longitude);
  const deltaLon = kaabaLon - userLon;
  const y = Math.sin(deltaLon);
  const x = Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLon);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

function normalizeMainHeading(degrees) {
  return (degrees % 360 + 360) % 360;
}

function loadStoredMainQiblaLocation() {
  try {
    const raw = localStorage.getItem("nooriva-qibla-last-location");
    const parsed = JSON.parse(raw || "null");
    if (typeof parsed?.latitude !== "number" || typeof parsed?.longitude !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function getMainScreenAngle() {
  if (window.screen?.orientation && typeof window.screen.orientation.angle === "number") {
    return window.screen.orientation.angle;
  }

  if (typeof window.orientation === "number") {
    return window.orientation;
  }

  return 0;
}

function updateMainQiblaVisual() {
  if (mainBearing === null) return;

  if (typeof mainHeading === "number") {
    const diff = ((mainBearing - mainHeading + 540) % 360) - 180;
    if (mainQiblaArrow) mainQiblaArrow.style.transform = `rotate(${diff}deg)`;
    if (mainQiblaPhone) mainQiblaPhone.style.opacity = "0.9";
    if (mainQiblaStatus) mainQiblaStatus.textContent = "Live qibla ready";
  } else {
    if (mainQiblaArrow) mainQiblaArrow.style.transform = `rotate(${mainBearing}deg)`;
    if (mainQiblaPhone) mainQiblaPhone.style.opacity = "0.16";
    if (mainQiblaStatus) mainQiblaStatus.textContent = "Saved qibla bearing";
  }
}

function startMainQiblaCompass() {
  const handleOrientation = (event) => {
    if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
      mainAbsoluteCompassReady = true;
      mainHeading = normalizeMainHeading(event.webkitCompassHeading);
    } else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
      if (event.absolute === true) {
        mainAbsoluteCompassReady = true;
      } else if (mainAbsoluteCompassReady) {
        return;
      }

      mainHeading = normalizeMainHeading(360 - event.alpha - getMainScreenAngle());
    }

    updateMainQiblaVisual();
  };

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function loadMainQibla() {
  const storedLocation = loadStoredMainQiblaLocation();

  if (storedLocation) {
    mainBearing = calculateMainQiblaBearing(storedLocation.latitude, storedLocation.longitude);
    updateMainQiblaVisual();
  }

  if (!navigator.geolocation) {
    if (mainQiblaStatus) {
      mainQiblaStatus.textContent = storedLocation ? "Using saved qibla bearing" : "Location unavailable";
    }
    if (!storedLocation && mainQiblaPhone) {
      mainQiblaPhone.style.opacity = "0.16";
    }
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      mainBearing = calculateMainQiblaBearing(position.coords.latitude, position.coords.longitude);
      updateMainQiblaVisual();
      startMainQiblaCompass();
    },
    () => {
      if (storedLocation) {
        if (mainQiblaStatus) mainQiblaStatus.textContent = "Using saved qibla bearing";
        startMainQiblaCompass();
        return;
      }

      if (mainQiblaStatus) mainQiblaStatus.textContent = "Location needed";
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 300000,
    },
  );
}

function copyMainAyahEnhanced() {
  if (!currentAyahOfDay) {
    return Promise.resolve();
  }

  const text = `${currentAyahOfDay.arabic}\n\n${currentAyahOfDay.english}\n\n${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`;

  if (navigator.share) {
    return navigator
      .share({
        title: `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`,
        text,
      })
      .then(() => {
        if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "Shared";
      })
      .catch(() => undefined);
  }

  return navigator.clipboard
    .writeText(text)
    .then(() => {
      if (mainAyahCopyStatus) {
        mainAyahCopyStatus.textContent = "Copied";
        window.setTimeout(() => {
          if (mainAyahCopyStatus.textContent === "Copied") {
            mainAyahCopyStatus.textContent = "";
          }
        }, 1800);
      }
    })
    .catch(() => {
      if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "Copy failed";
    });
}

async function loadMainQuranLastReadingEnhanced() {
  const state = loadQuranHomeState();
  const surahKey = String(state?.lastReading?.surahKey || state?.selectedKey || "1");
  const page = Math.max(1, Number(state?.lastReading?.page || state?.currentPage || 1));
  const bothChunkIndex = Math.max(0, Number(state?.bothChunkIndex || 0));
  const view = String(state?.lastReading?.view || state?.view || "both");

  try {
    const [surahResponse, pageResponse] = await Promise.all([
      fetch(`${mainAyahApiBase}/surah/${surahKey}`, { cache: "force-cache" }),
      fetch(`${mainAyahApiBase}/page/${page}/quran-uthmani`, { cache: "force-cache" }),
    ]);

    const surahPayload = await surahResponse.json();
    const pagePayload = await pageResponse.json();
    const surahName = surahPayload?.data?.englishName ?? `Surah ${surahKey}`;
    const ayahs = pagePayload?.data?.ayahs ?? [];
    const targetAyah = ayahs[Math.min(bothChunkIndex * 3, Math.max(ayahs.length - 1, 0))];
    const ayahNumber = targetAyah?.numberInSurah ?? 1;
    const viewLabel = view === "arabic" ? "Arabic" : view === "english" ? "English" : "Both";

    if (mainQuranLast) {
      mainQuranLast.textContent = surahName;
    }

    if (mainQuranLastMeta) {
      mainQuranLastMeta.textContent = `Ayah ${ayahNumber} · Page ${page} · ${viewLabel}`;
    }

    if (mainQuranResumePill) {
      mainQuranResumePill.textContent = `Resume ${surahName}`;
    }
  } catch {
    if (mainQuranLast) {
      mainQuranLast.textContent = "Continue reading";
    }
    if (mainQuranLastMeta) {
      mainQuranLastMeta.textContent = "Open your reading and continue where you left off.";
    }
    if (mainQuranResumePill) {
      mainQuranResumePill.textContent = "Resume";
    }
  }
}

function renderMainTasbeehEnhanced() {
  const state = getMainTasbeehState();
  if (mainTasbeehCount) mainTasbeehCount.textContent = String(state.count);

  if (mainTasbeehLabel) {
    try {
      const raw = localStorage.getItem("nooriva-tasbeeh-state");
      const parsed = JSON.parse(raw || "null");
      const mode = parsed?.activeDhikr;
      const labelMap = {
        subhanallah: "SubhanAllah",
        alhamdulillah: "Alhamdulillah",
        allahuakbar: "Allahu Akbar",
        astaghfirullah: "Astaghfirullah",
        custom: parsed?.customDhikrLabel || "Today",
      };
      mainTasbeehLabel.textContent = labelMap[mode] || "Today";
    } catch {
      mainTasbeehLabel.textContent = "Today";
    }
  }
}

mainAyahDownload?.addEventListener("click", copyMainAyahEnhanced);
window.addEventListener("resize", fitAyahCardText);
mainNotificationButton?.addEventListener("click", enableMainNotifications);
contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(contactSubmitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: contactName?.value, message: contactMessage?.value }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Message failed.");
    }
    if (contactStatus) contactStatus.textContent = "Message sent.";
    if (contactName) contactName.value = "";
    if (contactMessage) contactMessage.value = "";
  } catch (error) {
    if (contactStatus) contactStatus.textContent = error.message;
  }
});

renderMainGreeting();
renderMainDailyChecklist();
renderMainJumuah();
updateMainNotificationButton();
loadMainPrayer();
loadMainAyah();
loadMainQuranLastReadingEnhanced();
setupMainTasbeeh();
loadMainQibla();
loadMainPushPublicKey();
window.addEventListener("offline", () => {
  setMainConnectivityStatus("Offline. Showing saved data.", true);
});

window.addEventListener("online", () => {
  setMainConnectivityStatus("Back online.");
  loadMainPrayer().catch(() => undefined);
  loadMainAyah().catch(() => undefined);
  loadMainQuranLastReadingEnhanced().catch(() => undefined);
});

setInterval(() => {
  renderMainPrayer();
  maybeSendMainPrayerNotification().catch(() => undefined);
}, 1000);






