const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
const surahGrid = document.getElementById("quran-surah-grid");
const ayahList = document.getElementById("quran-ayah-list");
const searchInput = document.getElementById("quran-search");
const clearSearchButton = document.getElementById("quran-clear-search");
const quranStatus = document.getElementById("quran-status");
const bookmarkCopy = document.getElementById("quran-bookmark-copy");
const selectedMeta = document.getElementById("quran-selected-meta");
const selectedTitle = document.getElementById("quran-selected-title");
const selectedSubtitle = document.getElementById("quran-selected-subtitle");
const selectedArabic = document.getElementById("quran-selected-arabic");
const selectedTranslation = document.getElementById("quran-selected-translation");
const currentSurah = document.getElementById("quran-current-surah");
const bookmarkedSurah = document.getElementById("quran-bookmarked-surah");
const continueSurah = document.getElementById("quran-continue-surah");
const savedCount = document.getElementById("quran-saved-count");
const toggleBookmarkButton = document.getElementById("quran-toggle-bookmark");
const openBookmarkButton = document.getElementById("quran-open-bookmark");
const openContinueButton = document.getElementById("quran-open-continue");

let surahs = [];
let selectedSurahDetails = null;

function defaultState() {
  return {
    selectedKey: "1",
    bookmarkKey: "",
    savedKeys: [],
    search: "",
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
      savedKeys: Array.isArray(parsed.savedKeys) ? parsed.savedKeys.map(String) : [],
      search: parsed.search || "",
      continueReading: {
        surahKey: String(parsed?.continueReading?.surahKey || ""),
        ayahNumber: Number(parsed?.continueReading?.ayahNumber || 1),
      },
    };
  } catch (error) {
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

function getBookmarkedSurahName() {
  return surahs.find((item) => String(item.number) === quranState.bookmarkKey)?.englishName ?? "None yet";
}

function getContinueSurahName() {
  const surah = surahs.find((item) => String(item.number) === quranState.continueReading.surahKey);
  return surah ? `${surah.englishName} • Ayah ${quranState.continueReading.ayahNumber}` : "None yet";
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
  const response = await fetch(
    `${quranApiBaseUrl}/surah/${surahNumber}/editions/quran-uthmani,en.sahih`,
    { cache: "force-cache" },
  );

  if (!response.ok) {
    throw new Error("Unable to load the selected surah.");
  }

  const payload = await response.json();
  const editions = payload?.data ?? [];
  const arabicEdition = editions.find((edition) => edition?.edition?.identifier === "quran-uthmani");
  const translationEdition = editions.find((edition) => edition?.edition?.identifier === "en.sahih");

  return {
    arabicEdition,
    translationEdition,
  };
}

function renderSelectedSurah() {
  const surah = getSelectedSurah();

  if (!surah) {
    selectedMeta.textContent = "--";
    selectedTitle.textContent = "Loading...";
    selectedSubtitle.textContent = "Please wait";
    selectedArabic.textContent = "";
    selectedTranslation.textContent = "";
    currentSurah.textContent = "Loading...";
    bookmarkedSurah.textContent = "None yet";
    continueSurah.textContent = "None yet";
    savedCount.textContent = String(quranState.savedKeys.length);
    return;
  }

  const firstAyahArabic = selectedSurahDetails?.arabicEdition?.ayahs?.[0]?.text;
  const firstAyahTranslation = selectedSurahDetails?.translationEdition?.ayahs?.[0]?.text;

  selectedMeta.textContent = `${surah.numberOfAyahs} ayat`;
  selectedTitle.textContent = surah.englishName;
  selectedSubtitle.textContent = `${surah.englishNameTranslation} • ${surah.revelationType}`;
  selectedArabic.textContent = sanitizeArabicText(firstAyahArabic) || "Loading surah...";
  selectedTranslation.textContent = firstAyahTranslation || "Loading translation...";
  currentSurah.textContent = surah.englishName;
  bookmarkedSurah.textContent = getBookmarkedSurahName();
  continueSurah.textContent = getContinueSurahName();
  savedCount.textContent = String(quranState.savedKeys.length);

  const bookmarked = quranState.bookmarkKey === String(surah.number);
  toggleBookmarkButton.textContent = bookmarked ? "Bookmarked" : "Save bookmark";
  bookmarkCopy.textContent = bookmarked
    ? `${surah.englishName} is your active bookmark.`
    : "Bookmarks and reading position are saved on this device.";
}

function renderAyahList() {
  if (!ayahList) {
    return;
  }

  const surah = getSelectedSurah();
  const arabicAyahs = selectedSurahDetails?.arabicEdition?.ayahs ?? [];
  const translationAyahs = selectedSurahDetails?.translationEdition?.ayahs ?? [];

  if (!surah || arabicAyahs.length === 0 || translationAyahs.length === 0) {
    ayahList.innerHTML = `
      <article class="quran-ayah-card">
        <div class="quran-ayah-topline">
          <span>Ayah 1</span>
        </div>
        <p class="quran-ayah-arabic">Loading...</p>
        <p class="quran-ayah-translation">Please wait.</p>
      </article>
    `;
    return;
  }

  ayahList.innerHTML = arabicAyahs
    .map((ayah, index) => {
      const translation = translationAyahs[index];
      const ayahNumber = ayah.numberInSurah;
      const isContinue = quranState.continueReading.surahKey === String(surah.number)
        && quranState.continueReading.ayahNumber === ayahNumber;

      return `
        <article class="quran-ayah-card${isContinue ? " is-current-ayah" : ""}" data-ayah-number="${ayahNumber}">
          <div class="quran-ayah-topline">
            <span>Ayah ${ayahNumber}</span>
            <button class="quran-ayah-save" type="button" data-save-ayah="${ayahNumber}">
              Continue here
            </button>
          </div>
          <p class="quran-ayah-arabic">${sanitizeArabicText(ayah.text)}</p>
          <p class="quran-ayah-translation">${translation?.text ?? ""}</p>
        </article>
      `;
    })
    .join("");

  ayahList.querySelectorAll("[data-save-ayah]").forEach((button) => {
    button.addEventListener("click", () => {
      quranState.continueReading = {
        surahKey: quranState.selectedKey,
        ayahNumber: Number(button.dataset.saveAyah),
      };
      quranStatus.textContent = `Saved continue reading for Ayah ${button.dataset.saveAyah}.`;
      render();
      const target = document.querySelector(`[data-ayah-number="${button.dataset.saveAyah}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

function renderSurahGrid() {
  if (!surahGrid) {
    return;
  }

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
      const surahKey = String(surah.number);
      const active = surahKey === quranState.selectedKey ? " is-active" : "";
      const saved = quranState.savedKeys.includes(surahKey) ? " is-saved" : "";

      return `
        <button class="quran-surah-card${active}${saved}" data-surah-key="${surahKey}" type="button">
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
      quranState.selectedKey = String(button.dataset.surahKey);
      quranStatus.textContent = "Opening surah...";
      selectedSurahDetails = null;
      render();
      await loadSelectedSurahDetails();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function toggleBookmark() {
  const surah = getSelectedSurah();

  if (!surah) {
    return;
  }

  quranState.bookmarkKey = String(surah.number);

  if (!quranState.savedKeys.includes(String(surah.number))) {
    quranState.savedKeys.push(String(surah.number));
  }

  quranStatus.textContent = `${surah.englishName} saved.`;
  render();
}

async function openBookmark() {
  if (!quranState.bookmarkKey) {
    quranStatus.textContent = "No bookmark saved yet.";
    return;
  }

  quranState.selectedKey = quranState.bookmarkKey;
  quranStatus.textContent = "Opening bookmark...";
  selectedSurahDetails = null;
  render();
  await loadSelectedSurahDetails();
}

async function openContinueReading() {
  if (!quranState.continueReading.surahKey) {
    quranStatus.textContent = "No continue reading position saved yet.";
    return;
  }

  quranState.selectedKey = quranState.continueReading.surahKey;
  quranStatus.textContent = "Opening continue reading...";
  selectedSurahDetails = null;
  render();
  await loadSelectedSurahDetails();

  const target = document.querySelector(
    `[data-ayah-number="${quranState.continueReading.ayahNumber}"]`,
  );
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
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
  } catch (error) {
    quranStatus.textContent = error.message;
    render();
  }
}

function render() {
  if (searchInput) {
    searchInput.value = quranState.search;
  }

  renderSelectedSurah();
  renderSurahGrid();
  renderAyahList();
  saveState();
}

searchInput?.addEventListener("input", (event) => {
  quranState.search = event.target.value;
  renderSurahGrid();
  saveState();
});

clearSearchButton?.addEventListener("click", () => {
  quranState.search = "";
  quranStatus.textContent = "Search cleared.";
  render();
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
  } catch (error) {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

initQuran();
