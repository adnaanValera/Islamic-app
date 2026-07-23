const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
const surahGrid = document.getElementById("quran-surah-grid");
const ayahList = document.getElementById("quran-ayah-list");
const searchInput = document.getElementById("quran-search");
const quranStatus = document.getElementById("quran-status");
const bookmarkCopy = document.getElementById("quran-bookmark-copy");
const selectedMeta = document.getElementById("quran-selected-meta");
const selectedTitle = document.getElementById("quran-selected-title");
const selectedSubtitle = document.getElementById("quran-selected-subtitle");
const currentSurah = document.getElementById("quran-current-surah");
const continueSurah = document.getElementById("quran-continue-surah");
const toggleBookmarkButton = document.getElementById("quran-toggle-bookmark");
const openBookmarkButton = document.getElementById("quran-open-bookmark");
const openContinueButton = document.getElementById("quran-open-continue");
const previousSurahButton = document.getElementById("quran-prev-surah");
const nextSurahButton = document.getElementById("quran-next-surah");
const languageButtons = Array.from(document.querySelectorAll("[data-quran-view]"));

let surahs = [];
let selectedSurahDetails = null;

function defaultState() {
  return {
    selectedKey: "1",
    bookmarkKey: "",
    search: "",
    view: "both",
    continueReading: {
      surahKey: "",
      ayahNumber: 1,
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(quranStorageKey);
    if (!raw) {
      return defaultState();
    }

    const parsed = JSON.parse(raw);
    return {
      selectedKey: String(parsed.selectedKey || "1"),
      bookmarkKey: String(parsed.bookmarkKey || ""),
      search: parsed.search || "",
      view: ["arabic", "english", "both"].includes(parsed.view) ? parsed.view : "both",
      continueReading: {
        surahKey: String(parsed?.continueReading?.surahKey || ""),
        ayahNumber: Number(parsed?.continueReading?.ayahNumber || 1),
      },
    };
  } catch {
    return defaultState();
  }
}

let quranState = loadState();

function saveState() {
  localStorage.setItem(quranStorageKey, JSON.stringify(quranState));
}

function getSelectedSurah() {
  return surahs.find((surah) => String(surah.number) === quranState.selectedKey) ?? surahs[0] ?? null;
}

function getContinueSurahName() {
  const surah = surahs.find((item) => String(item.number) === quranState.continueReading.surahKey);
  return surah ? `${surah.englishName} • Ayah ${quranState.continueReading.ayahNumber}` : "Continue not set";
}

function sanitizeArabicText(text) {
  return String(text || "").replace(/^\uFEFF/, "").trim();
}

async function fetchSurahList() {
  const response = await fetch(`${quranApiBaseUrl}/surah`, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error("Unable to load Quran surahs.");
  }

  const payload = await response.json();
  return payload?.data ?? [];
}

async function fetchSurahDetails(surahNumber) {
  const response = await fetch(`${quranApiBaseUrl}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Unable to load the selected surah.");
  }

  const payload = await response.json();
  const editions = payload?.data ?? [];

  return {
    arabicEdition: editions.find((edition) => edition?.edition?.identifier === "quran-uthmani"),
    translationEdition: editions.find((edition) => edition?.edition?.identifier === "en.sahih"),
  };
}

function renderHeader() {
  const surah = getSelectedSurah();
  if (!surah) {
    return;
  }

  const activeIndex = surahs.findIndex((item) => String(item.number) === String(surah.number));
  const hasPrevious = activeIndex > 0;
  const hasNext = activeIndex !== -1 && activeIndex < surahs.length - 1;

  selectedTitle.textContent = surah.englishName;
  selectedSubtitle.textContent = `${surah.englishNameTranslation} • ${surah.revelationType}`;
  selectedMeta.textContent = `${surah.numberOfAyahs} ayat`;
  currentSurah.textContent = surah.englishName;
  continueSurah.textContent = getContinueSurahName();
  bookmarkCopy.textContent =
    quranState.bookmarkKey === String(surah.number)
      ? `${surah.englishName} is your active bookmark.`
      : "Your place is saved on this device.";
  toggleBookmarkButton.textContent =
    quranState.bookmarkKey === String(surah.number) ? "Bookmarked" : "Save bookmark";

  if (previousSurahButton) {
    previousSurahButton.disabled = !hasPrevious;
  }

  if (nextSurahButton) {
    nextSurahButton.disabled = !hasNext;
  }
}

function renderSurahGrid() {
  const term = quranState.search.trim().toLowerCase();
  const filtered = surahs.filter((surah) => {
    if (!term) {
      return true;
    }

    return (
      surah.englishName.toLowerCase().includes(term) ||
      surah.englishNameTranslation.toLowerCase().includes(term) ||
      surah.revelationType.toLowerCase().includes(term)
    );
  });

  surahGrid.innerHTML = filtered
    .map((surah) => {
      const active = String(surah.number) === quranState.selectedKey ? " is-active" : "";

      return `
        <button class="quran-surah-card${active}" data-surah-key="${surah.number}" type="button">
          <span class="quran-surah-number">${surah.number}</span>
          <strong>${surah.englishName}</strong>
          <small>${surah.englishNameTranslation}</small>
          <span class="quran-surah-meta">${surah.numberOfAyahs} ayat • ${surah.revelationType}</span>
        </button>
      `;
    })
    .join("");

  surahGrid.querySelectorAll("[data-surah-key]").forEach((button) => {
    button.addEventListener("click", async () => {
      await openSurahByKey(button.dataset.surahKey, "Opening surah...");
      document.querySelector(".quran-surah-dropdown")?.removeAttribute("open");
    });
  });
}

function renderViewButtons() {
  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.quranView === quranState.view);
  });
}

function buildArabicPages(arabicAyahs) {
  const pageSize = 8;
  const pages = [];

  for (let index = 0; index < arabicAyahs.length; index += pageSize) {
    const slice = arabicAyahs.slice(index, index + pageSize);
    pages.push(`
      <article class="quran-reading-page">
        <div class="quran-reading-page-topline">
          <span>Page ${Math.floor(index / pageSize) + 1}</span>
        </div>
        <p class="quran-reading-page-arabic">
          ${slice
            .map((ayah) => `${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`)
            .join(" ")}
        </p>
      </article>
    `);
  }

  return pages.join("");
}

function buildEnglishAyahs(arabicAyahs, translationAyahs) {
  return arabicAyahs
    .map(
      (ayah, index) => `
      <article class="quran-ayah-card" data-ayah-number="${ayah.numberInSurah}">
        <div class="quran-ayah-topline">
          <span>Ayah ${ayah.numberInSurah}</span>
          <button class="quran-ayah-save" type="button" data-save-ayah="${ayah.numberInSurah}">Continue here</button>
        </div>
        <p class="quran-ayah-translation">${translationAyahs[index]?.text ?? ""}</p>
      </article>
    `,
    )
    .join("");
}

function buildBothChunks(arabicAyahs, translationAyahs) {
  const chunkSize = 3;
  const chunks = [];

  for (let index = 0; index < arabicAyahs.length; index += chunkSize) {
    const arabicSlice = arabicAyahs.slice(index, index + chunkSize);
    const translationSlice = translationAyahs.slice(index, index + chunkSize);
    const startAyah = arabicSlice[0]?.numberInSurah ?? 1;
    const endAyah = arabicSlice[arabicSlice.length - 1]?.numberInSurah ?? startAyah;

    chunks.push(`
      <article class="quran-ayah-card quran-ayah-card-dual" data-ayah-number="${startAyah}">
        <div class="quran-ayah-topline">
          <span>Ayah ${startAyah}${endAyah !== startAyah ? `-${endAyah}` : ""}</span>
          <button class="quran-ayah-save" type="button" data-save-ayah="${startAyah}">Continue here</button>
        </div>
        <div class="quran-dual-block">
          <p class="quran-dual-arabic">
            ${arabicSlice
              .map((ayah) => `${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`)
              .join(" ")}
          </p>
          <div class="quran-dual-translation">
            ${translationSlice
              .map(
                (ayah, ayahIndex) => `
                  <p><strong>${arabicSlice[ayahIndex]?.numberInSurah ?? ""}.</strong> ${ayah?.text ?? ""}</p>
                `,
              )
              .join("")}
          </div>
        </div>
      </article>
    `);
  }

  return chunks.join("");
}

function attachContinueHandlers() {
  ayahList.querySelectorAll("[data-save-ayah]").forEach((button) => {
    button.addEventListener("click", () => {
      quranState.continueReading = {
        surahKey: quranState.selectedKey,
        ayahNumber: Number(button.dataset.saveAyah),
      };
      quranStatus.textContent = `Saved continue reading for Ayah ${button.dataset.saveAyah}.`;
      render();
    });
  });
}

function renderReading() {
  const surah = getSelectedSurah();
  const arabicAyahs = selectedSurahDetails?.arabicEdition?.ayahs ?? [];
  const translationAyahs = selectedSurahDetails?.translationEdition?.ayahs ?? [];

  if (!surah || arabicAyahs.length === 0 || translationAyahs.length === 0) {
    ayahList.innerHTML = `
      <article class="quran-reading-page">
        <div class="quran-reading-page-topline"><span>Loading</span></div>
        <p class="quran-reading-page-arabic">Please wait...</p>
      </article>
    `;
    return;
  }

  if (quranState.view === "arabic") {
    ayahList.className = "quran-ayah-list quran-ayah-list-pages";
    ayahList.innerHTML = buildArabicPages(arabicAyahs);
    return;
  }

  if (quranState.view === "english") {
    ayahList.className = "quran-ayah-list";
    ayahList.innerHTML = buildEnglishAyahs(arabicAyahs, translationAyahs);
    attachContinueHandlers();
    return;
  }

  ayahList.className = "quran-ayah-list";
  ayahList.innerHTML = buildBothChunks(arabicAyahs, translationAyahs);
  attachContinueHandlers();
}

function render() {
  if (searchInput) {
    searchInput.value = quranState.search;
  }

  renderHeader();
  renderViewButtons();
  renderSurahGrid();
  renderReading();
  saveState();
}

async function loadSelectedSurahDetails() {
  const surah = getSelectedSurah();
  if (!surah) {
    return;
  }

  try {
    selectedSurahDetails = await fetchSurahDetails(surah.number);
    quranStatus.textContent = `${surah.englishName} opened.`;
    render();
  } catch {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

async function openSurahByKey(surahKey, statusMessage = "Opening surah...") {
  quranState.selectedKey = String(surahKey);
  selectedSurahDetails = null;
  quranStatus.textContent = statusMessage;
  render();
  await loadSelectedSurahDetails();
}

function toggleBookmark() {
  const surah = getSelectedSurah();
  if (!surah) {
    return;
  }

  quranState.bookmarkKey = String(surah.number);
  quranStatus.textContent = `${surah.englishName} saved.`;
  render();
}

async function openBookmark() {
  if (!quranState.bookmarkKey) {
    quranStatus.textContent = "No bookmark saved yet.";
    return;
  }

  await openSurahByKey(quranState.bookmarkKey, "Opening bookmark...");
}

async function openContinueReading() {
  if (!quranState.continueReading.surahKey) {
    quranStatus.textContent = "No continue reading position saved yet.";
    return;
  }

  await openSurahByKey(quranState.continueReading.surahKey, "Opening continue reading...");

  const target = document.querySelector(`[data-ayah-number="${quranState.continueReading.ayahNumber}"]`);
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function stepSurah(direction) {
  const currentIndex = surahs.findIndex((surah) => String(surah.number) === quranState.selectedKey);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = currentIndex + direction;
  const nextSurah = surahs[nextIndex];
  if (!nextSurah) {
    return;
  }

  await openSurahByKey(nextSurah.number, `Opening ${nextSurah.englishName}...`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

searchInput?.addEventListener("input", (event) => {
  quranState.search = event.target.value;
  renderSurahGrid();
  saveState();
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quranState.view = button.dataset.quranView;
    render();
  });
});

previousSurahButton?.addEventListener("click", async () => {
  await stepSurah(-1);
});

nextSurahButton?.addEventListener("click", async () => {
  await stepSurah(1);
});

toggleBookmarkButton?.addEventListener("click", toggleBookmark);
openBookmarkButton?.addEventListener("click", openBookmark);
openContinueButton?.addEventListener("click", openContinueReading);

async function initQuran() {
  try {
    quranStatus.textContent = "Loading Quran...";
    surahs = await fetchSurahList();
    render();
    await loadSelectedSurahDetails();
  } catch {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

initQuran();
