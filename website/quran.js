const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
const surahGrid = document.getElementById("quran-surah-grid");
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
const savedCount = document.getElementById("quran-saved-count");
const toggleBookmarkButton = document.getElementById("quran-toggle-bookmark");
const openBookmarkButton = document.getElementById("quran-open-bookmark");

let surahs = [];
let selectedSurahDetails = null;

function defaultState() {
  return {
    selectedKey: "1",
    bookmarkKey: "",
    savedKeys: [],
    search: "",
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
    savedCount.textContent = String(quranState.savedKeys.length);
    return;
  }

  const arabicPreview = selectedSurahDetails?.arabicEdition?.ayahs
    ?.slice(0, Math.min(3, surah.numberOfAyahs))
    .map((ayah) => sanitizeArabicText(ayah.text))
    .join(" ۝ ");
  const translationPreview = selectedSurahDetails?.translationEdition?.ayahs
    ?.slice(0, Math.min(2, surah.numberOfAyahs))
    .map((ayah) => ayah.text)
    .join(" ");

  selectedMeta.textContent = `${surah.numberOfAyahs} ayat`;
  selectedTitle.textContent = surah.englishName;
  selectedSubtitle.textContent = `${surah.englishNameTranslation} • ${surah.revelationType}`;
  selectedArabic.textContent = arabicPreview || "Loading Arabic text...";
  selectedTranslation.textContent = translationPreview || "Loading translation...";
  currentSurah.textContent = surah.englishName;
  bookmarkedSurah.textContent = getBookmarkedSurahName();
  savedCount.textContent = String(quranState.savedKeys.length);

  const bookmarked = quranState.bookmarkKey === String(surah.number);
  toggleBookmarkButton.textContent = bookmarked ? "Bookmarked" : "Save bookmark";
  bookmarkCopy.textContent = bookmarked
    ? `${surah.englishName} is your active bookmark.`
    : "Bookmarks are saved on this device.";
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
      renderSelectedSurah();
      saveState();
      await loadSelectedSurahDetails();
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
  renderSelectedSurah();
  saveState();
  await loadSelectedSurahDetails();
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
    renderSelectedSurah();
  }
}

function render() {
  if (searchInput) {
    searchInput.value = quranState.search;
  }

  renderSelectedSurah();
  renderSurahGrid();
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
