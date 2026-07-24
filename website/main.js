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

const mainPrayers = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", label: "Fajr", endKey: "sunrise" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", label: "Zuhr", endKey: "asrShafi" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", label: "Asr", endKey: "sunset" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", label: "Maghrib", endKey: "eshaStarts" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", label: "Esha", endKey: null },
];
const accountSessionStorageKey = "nooriva-account-session";
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
    const startMinutes = getMainMinutes(prayer.salah) ?? getMainMinutes(prayer.athan) ?? 0;
    let endMinutes =
      index < mainPrayerRows.length - 1
        ? getMainMinutes(mainPrayerRows[index + 1]?.salah) ?? getMainMinutes(mainPrayerRows[index + 1]?.athan)
        : getMainMinutes(mainPrayerRows[0]?.salah) ?? getMainMinutes(mainPrayerRows[0]?.athan);

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
      const wrapsMidnight = prayer.endMinutes > 24 * 60;

      if (wrapsMidnight) {
        return currentMinutes >= prayer.startMinutes || currentMinutes < prayer.endMinutes - 24 * 60;
      }

      return currentMinutes >= prayer.startMinutes && currentMinutes < prayer.endMinutes;
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
      endTime: prayer.endKey ? data?.[prayer.endKey] ?? "--:--" : "--:--",
    }));
    mainSpecialMoments = {
      sunrise: data?.sunrise ?? "--:--",
      sunset: data?.sunset ?? "--:--",
      istiwa: data?.istiwa ?? "--:--",
      zawaalEnd: data?.zawaalEnd ?? "--:--",
    };

    renderMainPrayer();
    window.setInterval(renderMainPrayer, 60000);
  } catch {
    if (mainPrayerName) mainPrayerName.textContent = "Prayer unavailable";
    if (mainPrayerTime) mainPrayerTime.textContent = "--:--";
    if (mainNextSalah) mainNextSalah.textContent = "Next salah unavailable";
  }
}

function getAyahNumberForToday() {
  const { dateKey } = getMainMalawiParts();
  let seed = 0;

  for (const character of dateKey) {
    seed = (seed * 31 + character.charCodeAt(0)) % 6236;
  }

  return (seed % 6236) + 1;
}

async function loadMainAyah() {
  try {
    const ayahNumber = getAyahNumberForToday();
    const response = await fetch(`${mainAyahApiBase}/ayah/${ayahNumber}/editions/quran-uthmani,en.sahih`, {
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
      const isLongAyah = currentAyahOfDay.arabic.length > 170 || currentAyahOfDay.english.length > 220;
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

  while (size > min && element.scrollHeight > element.clientHeight) {
    size -= step;
    element.style.fontSize = `${size}px`;
  }
}

function fitAyahCardText() {
  const arabicLength = String(currentAyahOfDay?.arabic || "").length;
  const englishLength = String(currentAyahOfDay?.english || "").length;

  const tallVariant = mainAyahCardShell?.dataset.cardVariant === "tall";
  const arabicMax = tallVariant
    ? arabicLength < 120 ? 33 : 29
    : arabicLength < 70 ? 32 : arabicLength < 120 ? 29 : 26;
  const englishMax = tallVariant
    ? englishLength < 140 ? 15 : 13.5
    : englishLength < 90 ? 16 : englishLength < 150 ? 14 : 12.5;

  fitElementText(mainAyahArabic, { min: tallVariant ? 17 : 16, max: arabicMax, step: 1, lineHeight: tallVariant ? 1.56 : 1.6 });
  fitElementText(mainAyahEnglish, { min: 10, max: englishMax, step: 0.5, lineHeight: tallVariant ? 1.36 : 1.42 });

  const arabicHeight = mainAyahArabic?.scrollHeight ?? 0;
  const englishHeight = mainAyahEnglish?.scrollHeight ?? 0;
  const referenceHeight = mainAyahReference?.scrollHeight ?? 0;
  const gap = tallVariant ? (window.innerWidth <= 480 ? 14 : 20) : (window.innerWidth <= 480 ? 18 : 26);
  const contentHeight = arabicHeight + englishHeight + referenceHeight + gap;
  const frameHeight = mainAyahArabic?.parentElement?.clientHeight ?? 0;
  const topOffset = Math.max((frameHeight - contentHeight) / 2 + (tallVariant ? 8 : (window.innerWidth <= 480 ? 12 : 18)), 0);

  if (mainAyahReference?.parentElement) {
    mainAyahReference.parentElement.style.paddingTop = `${topOffset}px`;
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
      maxFontSize: tallVariant ? 58 : currentAyahOfDay.arabic.length < 90 ? 72 : 64,
      minFontSize: tallVariant ? 26 : 30,
      width: frameWidth * 0.9,
      maxHeight: frameHeight * (tallVariant ? 0.42 : 0.48),
      lineHeightRatio: tallVariant ? 1.3 : 1.38,
      weight: "600",
      family: "'Noto Naskh Arabic', serif",
    });
    const englishLayout = getBestCanvasTextLayout(context, currentAyahOfDay.english, {
      maxFontSize: tallVariant ? 26 : currentAyahOfDay.english.length < 110 ? 32 : 28,
      minFontSize: tallVariant ? 15 : 17,
      width: frameWidth * 0.78,
      maxHeight: frameHeight * (tallVariant ? 0.24 : 0.18),
      lineHeightRatio: tallVariant ? 1.38 : 1.5,
      weight: "500",
      family: "Manrope, sans-serif",
    });
    const referenceHeight = 34;
    const totalHeight = arabicLayout.totalHeight + 34 + englishLayout.totalHeight + 26 + referenceHeight;
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
      startY + arabicLayout.totalHeight + 34 + englishLayout.totalHeight + 26,
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
updateMainNotificationButton();
loadMainPrayer();
loadMainAyah();
setupMainTasbeeh();
loadMainQibla();
loadMainPushPublicKey();






