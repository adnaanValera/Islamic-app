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
const mainTasbeehButton = document.getElementById("main-tasbeeh-button");
const mainTasbeehCount = document.getElementById("main-tasbeeh-count");
const mainTasbeehLabel = document.getElementById("main-tasbeeh-label");

const mainPrayers = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", label: "Fajr", endKey: "sunrise" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", label: "Zuhr", endKey: "asrShafi" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", label: "Asr", endKey: "sunset" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", label: "Maghrib", endKey: "eshaStarts" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", label: "Esha", endKey: null },
];

let mainPrayerRows = [];
let mainHeading = null;
let mainBearing = null;
let currentAyahOfDay = null;

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

function getMainPrayerWindows() {
  return mainPrayerRows.map((prayer, index) => {
    const startMinutes = getMainMinutes(prayer.athan) ?? 0;
    let endMinutes = getMainMinutes(prayer.endTime);

    if (endMinutes === null) {
      endMinutes =
        index < mainPrayerRows.length - 1
          ? getMainMinutes(mainPrayerRows[index + 1].athan) ?? 24 * 60
          : 24 * 60;
    }

    return {
      ...prayer,
      startMinutes,
      endMinutes,
    };
  });
}

function renderMainPrayer() {
  if (!mainPrayerRows.length) return;

  const windows = getMainPrayerWindows();
  const { timeKey } = getMainMalawiParts();
  const currentMinutes = getMainMinutes(timeKey) ?? 0;

  const currentPrayer =
    windows.find((prayer) => currentMinutes >= prayer.startMinutes && currentMinutes < prayer.endMinutes) ?? null;
  const nextPrayer =
    windows.find((prayer) => prayer.startMinutes > currentMinutes) ?? windows[0] ?? null;
  const nextPrayerMinutes =
    nextPrayer && nextPrayer.startMinutes <= currentMinutes
      ? nextPrayer.startMinutes + 24 * 60
      : nextPrayer?.startMinutes ?? currentMinutes;

  if (mainPrayerLabel) {
    mainPrayerLabel.textContent = currentPrayer ? "Current" : "Next";
  }

  if (mainPrayerName) {
    mainPrayerName.textContent = currentPrayer?.label ?? nextPrayer?.label ?? "Prayer";
  }

  if (mainPrayerTime) {
    mainPrayerTime.textContent = currentPrayer?.salah ?? nextPrayer?.salah ?? "--:--";
  }

  if (mainNextSalah) {
    const minutesUntilNextSalah = nextPrayerMinutes - currentMinutes;
    mainNextSalah.textContent = `Next: ${nextPrayer?.label ?? "--"} in ${Math.max(minutesUntilNextSalah, 0)} min`;
  }

  if (mainPrayerProgress) {
    if (currentPrayer) {
      const windowLength = Math.max(currentPrayer.endMinutes - currentPrayer.startMinutes, 1);
      const elapsed = Math.min(Math.max(currentMinutes - currentPrayer.startMinutes, 0), windowLength);
      mainPrayerProgress.style.width = `${Math.max(8, Math.min((elapsed / windowLength) * 100, 100))}%`;
    } else {
      mainPrayerProgress.style.width = "0%";
    }
  }
}

async function loadMainPrayer() {
  try {
    const response = await fetch(mainPrayerApiUrl, { cache: "no-store" });
    const data = await response.json();

    mainPrayerRows = mainPrayers.map((prayer) => ({
      label: prayer.label,
      athan: data?.[prayer.athanKey] ?? "--:--",
      salah: data?.[prayer.salahKey] ?? "--:--",
      endTime: prayer.endKey ? data?.[prayer.endKey] ?? "--:--" : "--:--",
    }));

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
  } catch {
    if (mainAyahEnglish) mainAyahEnglish.textContent = "Ayah unavailable right now.";
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

function downloadAyahCard() {
  if (!currentAyahOfDay) {
    return;
  }

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

    context.font = "600 54px 'Noto Naskh Arabic', serif";
    const arabicLines = wrapCanvasText(context, currentAyahOfDay.arabic, 760);
    drawCenteredLines(context, arabicLines, canvas.width / 2, 410, 78);

    context.font = "500 28px Manrope, sans-serif";
    context.fillStyle = "#2b352f";
    const englishLines = wrapCanvasText(context, currentAyahOfDay.english, 700);
    drawCenteredLines(context, englishLines, canvas.width / 2, 690, 42);

    context.font = "700 24px Manrope, sans-serif";
    context.fillStyle = "#8e7440";
    context.fillText(`${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`, canvas.width / 2, 870);

    const link = document.createElement("a");
    const fileName = `${sanitizeFileNamePart(currentAyahOfDay.surahName)}-${sanitizeFileNamePart(currentAyahOfDay.ayahInSurah)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  };

  image.src = "./assets/ayah-card-template.jpeg";
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

loadMainPrayer();
loadMainAyah();
setupMainTasbeeh();
loadMainQibla();
