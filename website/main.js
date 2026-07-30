const mainPrayerApiUrl = "/api/prayer-times";
const mainAyahApiBase = "https://api.alquran.cloud/v1";
const mainMalawiTimeZone = "Africa/Blantyre";
const mainTasbeehStorageKey = "nooriva-main-tasbeeh";

const mainPrayerLabel = document.getElementById("main-prayer-label");
const mainPrayerName = document.getElementById("main-prayer-name");
const mainPrayerTime = document.getElementById("main-prayer-time");
const mainNextSalah = document.getElementById("main-next-salah");
const mainPrayerProgress = document.getElementById("main-prayer-progress");
const mainQiblaArrow = document.getElementById("main-qibla-arrow");
const mainQiblaPhone = document.getElementById("main-qibla-phone");
const mainQiblaStatus = document.getElementById("main-qibla-status");
const mainAyahArabic = document.getElementById("main-ayah-arabic");
const mainAyahEnglish = document.getElementById("main-ayah-english");
const mainAyahReference = document.getElementById("main-ayah-reference");
const mainAyahDownload = document.getElementById("main-ayah-download");
const mainGreeting = document.getElementById("main-greeting");
const mainNotificationButton = document.getElementById("main-enable-notifications");
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
let mainLastToggledPrayerLabel = "";
let mainLastToggleAt = 0;

function getMainMalawiParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: mainMalawiTimeZone,
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
      ? `Adhan ${nextAdhan?.label ?? "--"} ${nextAdhan?.athan ?? "--:--"} - ${formatHoursAndMinutes(minutesUntilAdhan)}`
      : `Next ${nextPrayer?.label ?? "--"} ${nextPrayer?.displayTime ?? "--:--"} - ${formatHoursAndMinutes(minutesUntilNextSalah)}`;
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
    const payload = await response.json();
    const data = payload?.data ?? {};

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

    renderMainPrayer();
    renderMainDailyChecklist();
    window.setInterval(renderMainPrayer, 60000);
  } catch {
    if (mainPrayerName) mainPrayerName.textContent = "Prayer unavailable";
    if (mainPrayerTime) mainPrayerTime.textContent = "--:--";
    if (mainNextSalah) mainNextSalah.textContent = "Next salah unavailable";
  }
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

    currentAyahOfDay = {
      surahName: english?.surah?.englishName ?? arabic?.surah?.englishName ?? "Quran",
      ayahInSurah: english?.numberInSurah ?? arabic?.numberInSurah ?? "",
      arabic: arabic?.text ?? "—",
      english: english?.text ?? "—",
    };

    if (mainAyahArabic) mainAyahArabic.textContent = currentAyahOfDay.arabic;
    if (mainAyahEnglish) mainAyahEnglish.textContent = currentAyahOfDay.english;
    if (mainAyahReference) {
      mainAyahReference.textContent = `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`;
    }
    if (mainAyahCardShell) {
      const isLongAyah = currentAyahOfDay.arabic.length > 120 || currentAyahOfDay.english.length > 150;
      mainAyahCardShell.dataset.cardVariant = isLongAyah ? "tall" : "default";
    }
    fitAyahCardText();
  } catch {
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
  const arabicLength = String(currentAyahOfDay?.arabic || "").length;
  const englishLength = String(currentAyahOfDay?.english || "").length;

  const tallVariant = mainAyahCardShell?.dataset.cardVariant === "tall";
  const arabicMax = tallVariant
    ? arabicLength < 120 ? 36 : arabicLength < 170 ? 32 : 29
    : arabicLength < 70 ? 35 : arabicLength < 120 ? 32 : 28;
  const englishMax = tallVariant
    ? englishLength < 140 ? 16.5 : englishLength < 210 ? 15 : 13.5
    : englishLength < 90 ? 17 : englishLength < 150 ? 15 : 13;

  fitElementText(mainAyahArabic, { min: tallVariant ? 19 : 18, max: arabicMax, step: 1, lineHeight: tallVariant ? 1.54 : 1.58 });
  fitElementText(mainAyahEnglish, { min: 11.5, max: englishMax, step: 0.5, lineHeight: tallVariant ? 1.4 : 1.44 });

  const arabicHeight = mainAyahArabic?.scrollHeight ?? 0;
  const englishHeight = mainAyahEnglish?.scrollHeight ?? 0;
  const contentBox = mainAyahArabic?.closest(".main-ayah-content");

  if (contentBox) {
    const contentBoxHeight = contentBox.clientHeight ?? 0;
    const gap = tallVariant ? (window.innerWidth <= 480 ? 12 : 16) : (window.innerWidth <= 480 ? 12 : 18);
    const contentHeight = arabicHeight + englishHeight + gap;
    const topOffset = Math.max((contentBoxHeight - contentHeight) / 2, 0);
    contentBox.style.paddingTop = `${topOffset}px`;
    contentBox.style.paddingBottom = `${Math.max(topOffset * 0.32, 0)}px`;
  }
}

function sanitizeFileNamePart(value) {
  return String(value || "Quran").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
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

  const tallVariant = mainAyahCardShell?.dataset.cardVariant === "tall";
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(image, 0, 0);
    context.textAlign = "center";
    context.fillStyle = "#13221c";

    const frameLeft = tallVariant ? canvas.width * 0.12 : canvas.width * 0.112;
    const frameTop = tallVariant ? canvas.height * 0.205 : canvas.height * 0.245;
    const frameWidth = tallVariant ? canvas.width * 0.76 : canvas.width * 0.776;
    const frameHeight = tallVariant ? canvas.height * 0.67 : canvas.height * 0.596;
    const centerX = frameLeft + frameWidth / 2;
    const arabicLayout = getBestCanvasTextLayout(context, currentAyahOfDay.arabic, {
      maxFontSize: tallVariant ? 64 : currentAyahOfDay.arabic.length < 90 ? 78 : 68,
      minFontSize: tallVariant ? 30 : 32,
      width: frameWidth * 0.92,
      maxHeight: frameHeight * (tallVariant ? 0.44 : 0.5),
      lineHeightRatio: tallVariant ? 1.28 : 1.34,
      weight: "600",
      family: "'Noto Naskh Arabic', serif",
    });
    const englishLayout = getBestCanvasTextLayout(context, currentAyahOfDay.english, {
      maxFontSize: tallVariant ? 28 : currentAyahOfDay.english.length < 110 ? 34 : 30,
      minFontSize: tallVariant ? 16 : 18,
      width: frameWidth * 0.82,
      maxHeight: frameHeight * (tallVariant ? 0.26 : 0.2),
      lineHeightRatio: tallVariant ? 1.4 : 1.48,
      weight: "500",
      family: "Manrope, sans-serif",
    });
    const referenceHeight = 34;
    const referenceGap = tallVariant ? 18 : 10;
    const totalHeight = arabicLayout.totalHeight + 34 + englishLayout.totalHeight + referenceGap + referenceHeight;
    const startY = frameTop + Math.max((frameHeight - totalHeight) / 2, 20);

    context.font = `600 ${arabicLayout.size}px 'Noto Naskh Arabic', serif`;
    drawCenteredLines(context, arabicLayout.lines, centerX, startY, arabicLayout.lineHeight);

    context.fillStyle = "#2b352f";
    context.font = `500 ${englishLayout.size}px Manrope, sans-serif`;
    drawCenteredLines(
      context,
      englishLayout.lines,
      centerX,
      startY + arabicLayout.totalHeight + 34,
      englishLayout.lineHeight,
    );

    context.font = "700 23px Manrope, sans-serif";
    context.fillStyle = "#8e7440";
    context.fillText(
      `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`,
      centerX,
      startY + arabicLayout.totalHeight + 34 + englishLayout.totalHeight + referenceGap,
    );

    const link = document.createElement("a");
    const fileName = `${sanitizeFileNamePart(currentAyahOfDay.surahName)}-${sanitizeFileNamePart(currentAyahOfDay.ayahInSurah)}.png`;
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }, "image/png");
  };

  image.src = tallVariant ? "./assets/ayah-card-template-tall.png" : "./assets/ayah-card-template.jpeg";
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

function setupMainTasbeeh() {
  renderMainTasbeeh();

  mainTasbeehButton?.addEventListener("click", () => {
    const state = getMainTasbeehState();
    state.count += 1;
    saveMainTasbeehState(state);
    renderMainTasbeeh();
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
    if (mainQiblaStatus) mainQiblaStatus.textContent = "Compass opening";
  }
}

function startMainQiblaCompass() {
  const handleOrientation = (event) => {
    if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
      mainHeading = normalizeMainHeading(event.webkitCompassHeading);
    } else if (typeof event.alpha === "number" && !Number.isNaN(event.alpha)) {
      mainHeading = normalizeMainHeading(360 - event.alpha);
    }

    updateMainQiblaVisual();
  };

  window.addEventListener("deviceorientationabsolute", handleOrientation, true);
  window.addEventListener("deviceorientation", handleOrientation, true);
}

function loadMainQibla() {
  if (!navigator.geolocation) {
    if (mainQiblaStatus) mainQiblaStatus.textContent = "Location unavailable";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      mainBearing = calculateMainQiblaBearing(position.coords.latitude, position.coords.longitude);
      updateMainQiblaVisual();
      startMainQiblaCompass();
    },
    () => {
      if (mainQiblaStatus) mainQiblaStatus.textContent = "Location needed";
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 300000,
    },
  );
}

mainAyahDownload?.addEventListener("click", downloadAyahCard);
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
updateMainNotificationButton();
loadMainPrayer();
loadMainAyah();
setupMainTasbeeh();
loadMainQibla();
loadMainPushPublicKey();






