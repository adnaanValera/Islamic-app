const mainPrayerApiUrl = "/api/prayer-times";
const mainDailyNoorApiUrl = "/api/daily-noor";
const pushPublicKeyApiUrl = "/api/push-public-key";
const pushSubscribeApiUrl = "/api/push-subscribe";
const contactSubmitUrl = "/api/contact-submit";
const mainAyahApiBase = "https://api.alquran.cloud/v1";
const mainMalawiTimeZone = "Africa/Blantyre";

const accountSessionStorageKey = "nooriva-account-session";
const quranHomeStorageKey = "nooriva-quran-state";
const mainPrayerChecklistStorageKey = "nooriva-prayer-checklist";
const mainPrayerCacheStorageKey = "nooriva-main-prayer-cache";
const mainDailyNoorCacheStorageKey = "nooriva-main-daily-noor-cache";
const mainTasbeehStorageKey = "nooriva-main-tasbeeh";
const mainReflectionNoteStorageKey = "nooriva-main-reflection-note";
const mainDailyCheckinStorageKey = "nooriva-main-daily-checkin";

const mainGreeting = document.getElementById("main-greeting");
const mainHeroNote = document.getElementById("main-hero-note");
const mainDatePill = document.getElementById("main-date-pill");
const homeInstallStatus = document.getElementById("home-install-status");
const mainNotificationButton = document.getElementById("main-enable-notifications");

const mainPrayerLabel = document.getElementById("main-prayer-label");
const mainPrayerName = document.getElementById("main-prayer-name");
const mainPrayerTime = document.getElementById("main-prayer-time");
const mainNextSalah = document.getElementById("main-next-salah");
const mainPrayerGuidance = document.getElementById("main-prayer-guidance");
const mainPrayerProgress = document.getElementById("main-prayer-progress");
const mainJumuahStrip = document.getElementById("main-jumuah-strip");
const mainJumuahTitle = document.getElementById("main-jumuah-title");
const mainJumuahMeta = document.getElementById("main-jumuah-meta");
const mainIntentionTitle = document.getElementById("main-intention-title");
const mainIntentionCopy = document.getElementById("main-intention-copy");

const mainDailyChecklist = document.getElementById("main-daily-checklist");
const mainDailyProgressBar = document.getElementById("main-daily-progress-bar");
const mainDailyHeadingCopy = document.getElementById("main-daily-heading-copy");
const mainDailyCaption = document.getElementById("main-daily-caption");
const mainDailyCheckinButton = document.getElementById("main-daily-checkin");

const mainAyahReference = document.getElementById("main-ayah-reference");
const mainAyahArabic = document.getElementById("main-ayah-arabic");
const mainAyahEnglish = document.getElementById("main-ayah-english");
const mainAyahReflection = document.getElementById("main-ayah-reflection");
const mainAyahSource = document.getElementById("main-ayah-source");
const mainAyahDownload = document.getElementById("main-ayah-download");
const mainAyahCopyStatus = document.getElementById("main-ayah-copy-status");

const mainDuaTitle = document.getElementById("main-dua-title");
const mainDuaArabic = document.getElementById("main-dua-arabic");
const mainDuaTransliteration = document.getElementById("main-dua-transliteration");
const mainDuaEnglish = document.getElementById("main-dua-english");
const mainDuaSource = document.getElementById("main-dua-source");

const mainReminderTitle = document.getElementById("main-reminder-title");
const mainReminderQuote = document.getElementById("main-reminder-quote");
const mainReminderReflection = document.getElementById("main-reminder-reflection");
const mainReminderSource = document.getElementById("main-reminder-source");

const mainHistoryTitle = document.getElementById("main-history-title");
const mainHistorySummary = document.getElementById("main-history-summary");
const mainHistorySource = document.getElementById("main-history-source");

const mainQuranLast = document.getElementById("main-quran-last");
const mainQuranLastMeta = document.getElementById("main-quran-last-meta");
const mainQuranResumePill = document.getElementById("main-quran-resume-pill");

const mainQiblaArrow = document.getElementById("main-qibla-arrow");
const mainQiblaPhone = document.getElementById("main-qibla-phone");
const mainQiblaStatus = document.getElementById("main-qibla-status");

const mainTasbeehButton = document.getElementById("main-tasbeeh-button");
const mainTasbeehCount = document.getElementById("main-tasbeeh-count");
const mainTasbeehLabel = document.getElementById("main-tasbeeh-label");

const mainReflectionNote = document.getElementById("main-reflection-note");
const mainReflectionStatus = document.getElementById("main-reflection-status");

const contactForm = document.getElementById("contact-form");
const contactName = document.getElementById("contact-name");
const contactMessage = document.getElementById("contact-message");
const contactStatus = document.getElementById("contact-status");
const mainLinkedCards = Array.from(document.querySelectorAll("[data-main-link]"));

const mainPrayers = [
  { label: "Fajr", athanKey: "fajrAthan", salahKey: "fajrJamaah", startKey: "fajrStarts", endKey: "sunrise" },
  { label: "Zuhr", athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", startKey: "zawaalEnd", endKey: "asrShafi" },
  { label: "Asr", athanKey: "asrAthan", salahKey: "asrJamaah", startKey: "asrShafi", endKey: "sunset" },
  { label: "Maghrib", athanKey: "maghribAthan", salahKey: "maghribJamaah", startKey: "sunset", endKey: "eshaStarts" },
  { label: "Esha", athanKey: "eshaAthan", salahKey: "eshaJamaah", startKey: "eshaStarts", endKey: null },
];

let mainPrayerRows = [];
let mainSpecialMoments = {};
let mainJumuahTimes = { adhan: "--:--", khutbah: "--:--" };
let mainLastNotificationMinuteKey = "";
let currentAyahOfDay = null;
let mainPushPublicKey = "";
let mainHeading = null;
let mainBearing = null;
let mainCompassSource = null;

function loadCachedJson(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function saveCachedJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
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

function setMainStatus(message, isOffline = false) {
  if (!homeInstallStatus) return;
  homeInstallStatus.textContent = message;
  homeInstallStatus.classList.toggle("is-offline", Boolean(isOffline));
}

function getMinutes(value) {
  const [hours, minutes] = String(value || "").split(":").map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function normalizeText(value, fallback = "—") {
  return String(value ?? fallback).replace(/\s*\n+\s*/g, " ").replace(/\s+/g, " ").trim();
}

function formatHoursAndMinutes(totalMinutes) {
  const safeMinutes = Math.max(totalMinutes, 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  if (hours <= 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
}

function loadMainSession() {
  return loadCachedJson(accountSessionStorageKey, null);
}

function setupMainCardLinks() {
  mainLinkedCards.forEach((card) => {
    const href = card.getAttribute("data-main-link");
    if (!href) return;

    card.addEventListener("click", (event) => {
      const interactiveTarget = event.target.closest("button, a, input, textarea, select, summary");
      if (interactiveTarget && interactiveTarget !== card) return;
      window.location.href = href;
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const interactiveTarget = event.target.closest("button, a, input, textarea, select, summary");
      if (interactiveTarget && interactiveTarget !== card) return;
      event.preventDefault();
      window.location.href = href;
    });
  });
}

function renderMainGreeting() {
  const session = loadMainSession();
  const name = session?.user?.fullName?.trim();
  const salaam = "السلام عليكم";
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: mainMalawiTimeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  if (mainGreeting) {
    mainGreeting.textContent = name ? `${salaam} ${name}` : salaam;
  }

  if (mainDatePill) {
    mainDatePill.textContent = dateLabel;
  }

  if (mainHeroNote) {
    const { weekday } = getMainMalawiParts();
    mainHeroNote.textContent =
      weekday === "Friday"
        ? "May Allah accept your Jumu'ah and fill your day with barakah."
        : "Open Nooriva for salah, Quran, and one moment of sincere return to Allah.";
  }
}

function getMainChecklistState() {
  const { dateKey } = getMainMalawiParts();
  const raw = loadCachedJson(mainPrayerChecklistStorageKey, null);
  if (!raw || raw.dateKey !== dateKey) {
    return { dateKey, checked: {} };
  }
  return { dateKey, checked: raw.checked ?? {} };
}

function saveMainChecklistState(checked) {
  const { dateKey } = getMainMalawiParts();
  saveCachedJson(mainPrayerChecklistStorageKey, { dateKey, checked });
}

function getPrayerWindows() {
  return mainPrayerRows.map((prayer, index) => {
    const startMinutes = getMinutes(prayer.startTime) ?? getMinutes(prayer.salah) ?? getMinutes(prayer.athan) ?? 0;
    let endMinutes = getMinutes(prayer.endTime);

    if (endMinutes === null) {
      endMinutes =
        index < mainPrayerRows.length - 1
          ? getMinutes(mainPrayerRows[index + 1]?.startTime) ?? getMinutes(mainPrayerRows[index + 1]?.salah)
          : getMinutes(mainPrayerRows[0]?.startTime) ?? getMinutes(mainPrayerRows[0]?.salah);
    }

    if (endMinutes === null) endMinutes = 24 * 60;
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;

    return {
      ...prayer,
      startMinutes,
      endMinutes,
      athanMinutes: getMinutes(prayer.athan),
    };
  });
}

function buildActivityEntries() {
  const prayers = getPrayerWindows().map((entry) => ({
    ...entry,
    kind: "prayer",
    displayTime: entry.salah,
  }));

  const sunrise = getMinutes(mainSpecialMoments.sunrise);
  const sunset = getMinutes(mainSpecialMoments.sunset);
  const istiwa = getMinutes(mainSpecialMoments.istiwa);
  const zawaalEnd = getMinutes(mainSpecialMoments.zawaalEnd);

  const special = [];

  if (sunrise !== null) {
    special.push({ label: "Sunrise", displayTime: mainSpecialMoments.sunrise, startMinutes: sunrise, endMinutes: sunrise + 20, kind: "special" });
  }
  if (istiwa !== null && zawaalEnd !== null && zawaalEnd > istiwa) {
    special.push({ label: "Zawwal", displayTime: mainSpecialMoments.istiwa, startMinutes: istiwa, endMinutes: zawaalEnd, kind: "special" });
  }
  if (sunset !== null) {
    special.push({ label: "Sunset", displayTime: mainSpecialMoments.sunset, startMinutes: sunset, endMinutes: sunset + 20, kind: "special" });
  }

  return [...prayers, ...special].sort((a, b) => a.startMinutes - b.startMinutes);
}

function getCurrentAndNextActivity() {
  const activities = buildActivityEntries();
  const { timeKey } = getMainMalawiParts();
  const currentMinutes = getMinutes(timeKey) ?? 0;

  const current =
    activities.find((item) => {
      const adjustedCurrentMinutes =
        item.endMinutes <= item.startMinutes && currentMinutes < item.startMinutes
          ? currentMinutes + 24 * 60
          : currentMinutes;
      const wrapsMidnight = item.endMinutes <= item.startMinutes || item.endMinutes > 24 * 60;

      if (wrapsMidnight) {
        return adjustedCurrentMinutes >= item.startMinutes && adjustedCurrentMinutes < item.endMinutes;
      }

      return adjustedCurrentMinutes >= item.startMinutes && adjustedCurrentMinutes < item.endMinutes;
    }) ?? null;

  const next =
    activities
      .map((item) => ({
        ...item,
        effectiveStart: item.startMinutes > currentMinutes ? item.startMinutes : item.startMinutes + 24 * 60,
      }))
      .sort((a, b) => a.effectiveStart - b.effectiveStart)[0] ?? null;

  return { current, next, currentMinutes };
}

function getChecklistHighlight() {
  const { current, next } = getCurrentAndNextActivity();
  if (current?.kind === "prayer") return { label: current.label, state: "current" };
  if (next?.kind === "prayer") return { label: next.label, state: "next" };
  return null;
}

function renderMainPrayer() {
  if (!mainPrayerRows.length) return;

  const activities = buildActivityEntries();
  const { current, next, currentMinutes } = getCurrentAndNextActivity();
  const nextAdhan =
    activities
      .filter((item) => item.kind === "prayer")
      .map((item) => ({
        ...item,
        effectiveAthan:
          (item.athanMinutes ?? 0) > currentMinutes ? item.athanMinutes ?? 0 : (item.athanMinutes ?? 0) + 24 * 60,
      }))
      .sort((a, b) => a.effectiveAthan - b.effectiveAthan)[0] ?? null;

  if (mainPrayerLabel) mainPrayerLabel.textContent = current ? "Active now" : "Next";
  if (mainPrayerName) mainPrayerName.textContent = current?.label ?? next?.label ?? "Prayer";

  if (mainPrayerTime) {
    if (current?.kind === "prayer") {
      mainPrayerTime.textContent = `Salah ${current.displayTime ?? "--:--"}`;
    } else if (current) {
      mainPrayerTime.textContent = current.displayTime ?? "--:--";
    } else {
      mainPrayerTime.textContent = next?.kind === "prayer" ? `Salah ${next.displayTime ?? "--:--"}` : next?.displayTime ?? "--:--";
    }
  }

  if (mainNextSalah) {
    if (current) {
      const nextAthanWait = Math.max((nextAdhan?.effectiveAthan ?? currentMinutes) - currentMinutes, 0);
      mainNextSalah.textContent = `Next adhan · ${nextAdhan?.label ?? "--"} · ${nextAdhan?.athan ?? "--:--"} · ${formatHoursAndMinutes(nextAthanWait)}`;
    } else {
      const nextWait = Math.max((next?.effectiveStart ?? currentMinutes) - currentMinutes, 0);
      mainNextSalah.textContent = `Next salah · ${next?.label ?? "--"} · ${next?.displayTime ?? "--:--"} · ${formatHoursAndMinutes(nextWait)}`;
    }
  }

  if (mainPrayerGuidance) {
    if (current?.kind === "prayer") {
      mainPrayerGuidance.textContent = `${current.label} is active now. Turn to Allah before the window passes.`;
    } else if (current) {
      mainPrayerGuidance.textContent = `${current.label} is active now. Stay aware of the next salah.`;
    } else if (next?.label) {
      mainPrayerGuidance.textContent = `Prepare for ${next.label} with wudhu, calm, and intention.`;
    } else {
      mainPrayerGuidance.textContent = "Stay close to your prayer times today.";
    }
  }

  if (mainIntentionTitle && mainIntentionCopy) {
    if (current?.kind === "prayer") {
      mainIntentionTitle.textContent = `${current.label} first`;
      mainIntentionCopy.textContent = `Answer ${current.label} with calm, presence, and sincerity. Let the rest of your day follow from this salah.`;
    } else if (next?.label) {
      mainIntentionTitle.textContent = `Prepare for ${next.label}`;
      mainIntentionCopy.textContent = `Keep your heart ready for ${next.label}. A day anchored in salah makes room for everything else to carry barakah.`;
    } else {
      mainIntentionTitle.textContent = "For today";
      mainIntentionCopy.textContent = "Begin with your salah, then let the rest of your day follow from it.";
    }
  }

  if (mainPrayerProgress) {
    if (current) {
      const length = Math.max(current.endMinutes - current.startMinutes, 1);
      const elapsed = Math.min(Math.max(currentMinutes - current.startMinutes, 0), length);
      const progress = Math.max(8, Math.min((elapsed / length) * 100, 100));
      mainPrayerProgress.style.width = `${progress}%`;
    } else {
      mainPrayerProgress.style.width = "0%";
    }
  }

  document.querySelector(".main-prayer-banner")?.classList.toggle("is-active", Boolean(current));
}

function toggleChecklistPrayer(prayerLabel) {
  const current = getMainChecklistState();
  current.checked[prayerLabel] = !Boolean(current.checked?.[prayerLabel]);
  saveMainChecklistState(current.checked);
  renderMainDailyChecklist();
}

function renderMainDailyChecklist() {
  if (!mainDailyChecklist) return;

  const checklist = getMainChecklistState();
  const highlight = getChecklistHighlight();
  const checkedCount = mainPrayers.filter((prayer) => Boolean(checklist.checked?.[prayer.label])).length;

  mainDailyChecklist.innerHTML = mainPrayers
    .map((prayer) => {
      const isChecked = Boolean(checklist.checked?.[prayer.label]);
      const isCurrent = highlight?.label === prayer.label && highlight?.state === "current";
      const isNext = highlight?.label === prayer.label && highlight?.state === "next";

      return `
        <div class="main-daily-item${isChecked ? " is-checked" : ""}${isCurrent ? " is-current" : ""}${isNext ? " is-next" : ""}">
          <div class="main-daily-name-wrap">
            <button
              class="main-daily-name"
              type="button"
              data-main-prayer-check="${prayer.label}"
              aria-pressed="${isChecked ? "true" : "false"}"
            >☾ ${prayer.label}</button>
          </div>
          <button
            class="main-daily-tick-button"
            type="button"
            data-main-prayer-check="${prayer.label}"
            aria-label="Mark ${prayer.label} as ${isChecked ? "not completed" : "completed"}"
          >
            <span class="main-daily-tick" aria-hidden="true"></span>
          </button>
        </div>
      `;
    })
    .join("");

  if (mainDailyProgressBar) {
    mainDailyProgressBar.style.width = `${Math.max(0, Math.min((checkedCount / mainPrayers.length) * 100, 100))}%`;
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
      toggleChecklistPrayer(button.dataset.mainPrayerCheck);
    });
  });
}

function renderMainJumuah() {
  if (!mainJumuahStrip || !mainJumuahMeta || !mainJumuahTitle) return;

  const { weekday } = getMainMalawiParts();
  const isFriday = weekday === "Friday";
  mainJumuahStrip.hidden = !isFriday;

  if (!isFriday) {
    mainJumuahTitle.textContent = "Jumu'ah";
    mainJumuahMeta.textContent = "";
    return;
  }

  mainJumuahTitle.textContent = "Jumu'ah today";
  mainJumuahMeta.textContent = `Adhan ${mainJumuahTimes.adhan} · Khutbah ${mainJumuahTimes.khutbah}`;
}

async function loadMainPrayer() {
  try {
    const response = await fetch(mainPrayerApiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Prayer API returned ${response.status}`);
    const payload = await response.json();
    const data = payload?.data ?? {};

    saveCachedJson(mainPrayerCacheStorageKey, { savedAt: Date.now(), data });

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
    setMainStatus("Ready.");
  } catch {
    const cached = loadCachedJson(mainPrayerCacheStorageKey, null);
    const data = cached?.data ?? null;

    if (!data) {
      setMainStatus("Offline. Connect once to load your prayer data.", true);
      return;
    }

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
    setMainStatus("Offline. Showing saved prayer times.", true);
  }
}

function fitElementText(element, { min, max, step = 1, lineHeight }) {
  if (!element) return;
  let size = max;
  element.style.fontSize = `${size}px`;
  if (lineHeight) element.style.lineHeight = String(lineHeight);

  while (size > min && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
    size -= step;
    element.style.fontSize = `${size}px`;
  }
}

function fitAyahCardText() {
  if (mainAyahArabic) fitElementText(mainAyahArabic, { min: 19, max: 28, step: 1, lineHeight: 1.68 });
  if (mainAyahEnglish) fitElementText(mainAyahEnglish, { min: 11, max: 15, step: 0.5, lineHeight: 1.55 });
}

function renderMainDailyNoor(payload) {
  if (!payload) return;

  currentAyahOfDay = {
    surahName: payload.ayah?.surahName ?? "Quran",
    ayahInSurah: payload.ayah?.ayahInSurah ?? "",
    arabic: normalizeText(payload.ayah?.arabic),
    english: normalizeText(payload.ayah?.english, "Ayah unavailable right now."),
    reflection: normalizeText(payload.ayah?.reflection, ""),
    source: normalizeText(payload.ayah?.source, "Quran"),
  };

  if (mainAyahReference) mainAyahReference.textContent = `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`.trim();
  if (mainAyahArabic) mainAyahArabic.textContent = currentAyahOfDay.arabic;
  if (mainAyahEnglish) mainAyahEnglish.textContent = currentAyahOfDay.english;
  if (mainAyahReflection) mainAyahReflection.textContent = currentAyahOfDay.reflection || "Open the Quran and sit with one verse today.";
  if (mainAyahSource) mainAyahSource.textContent = currentAyahOfDay.source || "Quran";
  if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "";

  if (mainDuaTitle) mainDuaTitle.textContent = payload.dua?.title ?? "Dua of the day";
  if (mainDuaArabic) mainDuaArabic.textContent = payload.dua?.arabic ?? "—";
  if (mainDuaTransliteration) mainDuaTransliteration.textContent = payload.dua?.transliteration ?? "";
  if (mainDuaEnglish) mainDuaEnglish.textContent = payload.dua?.english ?? "";
  if (mainDuaSource) mainDuaSource.textContent = payload.dua?.source ?? "Authentic source";

  if (mainReminderTitle) mainReminderTitle.textContent = payload.reminder?.title ?? "Daily reminder";
  if (mainReminderQuote) mainReminderQuote.textContent = payload.reminder?.quote ?? "";
  if (mainReminderReflection) mainReminderReflection.textContent = payload.reminder?.reflection ?? "";
  if (mainReminderSource) mainReminderSource.textContent = payload.reminder?.source ?? "Quran / Hadith";

  if (mainHistoryTitle) mainHistoryTitle.textContent = payload.history?.title ?? "From Islamic history";
  if (mainHistorySummary) mainHistorySummary.textContent = payload.history?.summary ?? "";
  if (mainHistorySource) mainHistorySource.textContent = payload.history?.source ?? "Daily feature";

  [
    mainAyahArabic,
    mainAyahEnglish,
    mainAyahReflection,
    mainAyahSource,
    mainDuaSource,
    mainDuaTitle,
    mainDuaArabic,
    mainDuaTransliteration,
    mainDuaEnglish,
    mainReminderSource,
    mainReminderTitle,
    mainReminderQuote,
    mainReminderReflection,
    mainHistoryTitle,
    mainHistorySummary,
  ].forEach((element) => element?.classList.remove("is-loading"));

  fitAyahCardText();
}

async function loadMainDailyNoor() {
  try {
    const response = await fetch(mainDailyNoorApiUrl, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Today's Noor is unavailable.");
    saveCachedJson(mainDailyNoorCacheStorageKey, payload);
    renderMainDailyNoor(payload);
  } catch {
    const cached = loadCachedJson(mainDailyNoorCacheStorageKey, null);
    if (cached?.ayah || cached?.ok) {
      renderMainDailyNoor(cached);
      if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "Offline copy ready.";
      return;
    }

    if (mainAyahEnglish) mainAyahEnglish.textContent = "Today's Noor is unavailable right now.";
  }
}

function copyMainAyah() {
  if (!currentAyahOfDay) return Promise.resolve();

  const text = `${currentAyahOfDay.arabic}\n\n${currentAyahOfDay.english}\n\nReflection: ${currentAyahOfDay.reflection}\n\n${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`;

  if (navigator.share) {
    return navigator.share({
      title: `${currentAyahOfDay.surahName} ${currentAyahOfDay.ayahInSurah}`,
      text,
    }).then(() => {
      if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "Shared";
    }).catch(() => undefined);
  }

  return navigator.clipboard.writeText(text).then(() => {
    if (mainAyahCopyStatus) {
      mainAyahCopyStatus.textContent = "Copied";
      window.setTimeout(() => {
        if (mainAyahCopyStatus.textContent === "Copied") {
          mainAyahCopyStatus.textContent = "";
        }
      }, 1800);
    }
  }).catch(() => {
    if (mainAyahCopyStatus) mainAyahCopyStatus.textContent = "Copy failed";
  });
}

function loadQuranHomeState() {
  return loadCachedJson(quranHomeStorageKey, null);
}

async function loadMainQuranLastReading() {
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

    if (mainQuranLast) mainQuranLast.textContent = surahName;
    if (mainQuranLastMeta) mainQuranLastMeta.textContent = `Ayah ${ayahNumber} · Page ${page} · ${viewLabel}`;
    if (mainQuranResumePill) mainQuranResumePill.textContent = `Resume ${surahName}`;
  } catch {
    if (mainQuranLast) mainQuranLast.textContent = "Continue reading";
    if (mainQuranLastMeta) mainQuranLastMeta.textContent = "Open your reading and continue where you left off.";
    if (mainQuranResumePill) mainQuranResumePill.textContent = "Resume";
  }
}

function getMainTasbeehState() {
  const { dateKey } = getMainMalawiParts();
  const raw = loadCachedJson(mainTasbeehStorageKey, null);
  if (!raw || raw.dateKey !== dateKey) return { dateKey, count: 0 };
  return { dateKey, count: Number(raw.count) || 0 };
}

function saveMainTasbeehState(state) {
  saveCachedJson(mainTasbeehStorageKey, state);
}

function renderMainTasbeeh() {
  const state = getMainTasbeehState();
  if (mainTasbeehCount) mainTasbeehCount.textContent = String(state.count);

  if (mainTasbeehLabel) {
    try {
      const parsed = loadCachedJson("nooriva-tasbeeh-state", null);
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

function loadReflectionNote() {
  const { dateKey } = getMainMalawiParts();
  const payload = loadCachedJson(mainReflectionNoteStorageKey, {});
  return payload?.[dateKey] ?? "";
}

function saveReflectionNote(note) {
  const { dateKey } = getMainMalawiParts();
  const payload = loadCachedJson(mainReflectionNoteStorageKey, {});
  payload[dateKey] = note;
  saveCachedJson(mainReflectionNoteStorageKey, payload);
}

function setupReflectionNote() {
  if (!mainReflectionNote) return;
  mainReflectionNote.value = loadReflectionNote();
  mainReflectionNote.addEventListener("input", () => {
    saveReflectionNote(mainReflectionNote.value);
    if (mainReflectionStatus) mainReflectionStatus.textContent = "Saved on this device.";
  });
}

function getDailyCheckinState() {
  const { dateKey } = getMainMalawiParts();
  const payload = loadCachedJson(mainDailyCheckinStorageKey, {});
  return Boolean(payload?.[dateKey]);
}

function saveDailyCheckinState(value) {
  const { dateKey } = getMainMalawiParts();
  const payload = loadCachedJson(mainDailyCheckinStorageKey, {});
  payload[dateKey] = value;
  saveCachedJson(mainDailyCheckinStorageKey, payload);
}

function renderDailyCheckin() {
  if (!mainDailyCheckinButton) return;
  const checkedIn = getDailyCheckinState();
  mainDailyCheckinButton.classList.toggle("is-active", checkedIn);
  mainDailyCheckinButton.textContent = checkedIn ? "Alhamdulillah, I returned today" : "I showed up today";
}

function setupDailyCheckin() {
  renderDailyCheckin();
  mainDailyCheckinButton?.addEventListener("click", () => {
    saveDailyCheckinState(!getDailyCheckinState());
    renderDailyCheckin();
  });
}

function base64UrlToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) output[index] = raw.charCodeAt(index);
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
  let permission = Notification.permission;
  if (permission !== "granted") permission = await Notification.requestPermission();
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

  updateMainNotificationButton();
}

function updateMainNotificationButton() {
  if (!mainNotificationButton || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    mainNotificationButton.style.display = "none";
  } else if (Notification.permission === "denied") {
    mainNotificationButton.textContent = "Notifications blocked";
    mainNotificationButton.disabled = true;
  }
}

async function showMainPrayerNotification(prayer) {
  const title = `${prayer.label} time`;
  const body = "The Messenger of Allah ﷺ said: ‘The covenant that distinguishes between us and them is prayer; so whoever leaves it, he has committed Kufr.’";

  try {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: "./assets/icon-192.png",
        badge: "./assets/favicon-32.png",
        tag: `nooriva-main-adhan-${prayer.label.toLowerCase()}`,
        renotify: true,
        data: { url: "/prayer.html" },
      });
      return true;
    }
  } catch {
    // Fall through.
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
  if (!("Notification" in window) || Notification.permission !== "granted" || !mainPrayerRows.length) return;

  const { dateKey, timeKey, secondKey } = getMainMalawiParts();
  const minuteKey = `${dateKey}:${timeKey}`;

  if (mainLastNotificationMinuteKey === minuteKey || secondKey !== "00") return;
  mainLastNotificationMinuteKey = minuteKey;

  for (const prayer of mainPrayerRows) {
    const storageKey = `nooriva-notified-${dateKey}-${prayer.label.toLowerCase()}`;
    if (prayer.athan === timeKey && !localStorage.getItem(storageKey)) {
      const shown = await showMainPrayerNotification(prayer);
      if (shown) localStorage.setItem(storageKey, "true");
    }
  }
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

function normalizeHeading(degrees) {
  return (degrees % 360 + 360) % 360;
}

function getCompassPriority(source) {
  if (source === "webkit") return 3;
  if (source === "absolute") return 2;
  if (source === "relative") return 1;
  return 0;
}

function loadStoredMainQiblaLocation() {
  const parsed = loadCachedJson("nooriva-qibla-last-location", null);
  if (typeof parsed?.latitude !== "number" || typeof parsed?.longitude !== "number") return null;
  return parsed;
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

function getMainQiblaReading(event) {
  if (typeof event.webkitCompassHeading === "number" && !Number.isNaN(event.webkitCompassHeading)) {
    return { heading: normalizeHeading(event.webkitCompassHeading), source: "webkit" };
  }

  if (typeof event.alpha !== "number" || Number.isNaN(event.alpha)) return null;

  if (event.absolute === true) {
    return { heading: normalizeHeading(360 - event.alpha), source: "absolute" };
  }

  return { heading: normalizeHeading(360 - event.alpha - getMainScreenAngle()), source: "relative" };
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
    const reading = getMainQiblaReading(event);
    if (!reading) return;
    if (mainCompassSource && getCompassPriority(reading.source) < getCompassPriority(mainCompassSource)) return;
    mainCompassSource = reading.source;
    mainHeading = reading.heading;
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
    if (mainQiblaStatus) mainQiblaStatus.textContent = storedLocation ? "Using saved qibla bearing" : "Location unavailable";
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

mainAyahDownload?.addEventListener("click", () => {
  copyMainAyah().catch(() => undefined);
});

mainNotificationButton?.addEventListener("click", () => {
  enableMainNotifications().catch(() => undefined);
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(contactSubmitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: contactName?.value, message: contactMessage?.value }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Message failed.");

    if (contactStatus) contactStatus.textContent = "Message sent.";
    if (contactName) contactName.value = "";
    if (contactMessage) contactMessage.value = "";
  } catch (error) {
    if (contactStatus) contactStatus.textContent = error.message || "Message failed.";
  }
});

window.addEventListener("resize", fitAyahCardText);
window.addEventListener("offline", () => setMainStatus("Offline. Showing saved data.", true));
window.addEventListener("online", () => {
  setMainStatus("Back online.");
  loadMainPrayer().catch(() => undefined);
  loadMainDailyNoor().catch(() => undefined);
  loadMainQuranLastReading().catch(() => undefined);
});

renderMainGreeting();
setupMainCardLinks();
updateMainNotificationButton();
renderDailyCheckin();
setupDailyCheckin();
setupReflectionNote();
loadMainPrayer();
loadMainDailyNoor();
loadMainQuranLastReading();
setupMainTasbeeh();
loadMainQibla();
loadMainPushPublicKey();

if ("Notification" in window && Notification.permission === "granted") {
  enableMainNotifications().catch(() => undefined);
}

window.setInterval(() => {
  renderMainPrayer();
  maybeSendMainPrayerNotification().catch(() => undefined);
}, 1000);

window.setInterval(() => {
  renderMainJumuah();
  renderDailyCheckin();
}, 60000);
