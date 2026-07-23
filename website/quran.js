const quranStorageKey = "nooriva-quran-state";
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

const surahs = [
  {
    id: 1,
    key: "fatihah",
    name: "Al-Fatihah",
    meaning: "The Opening",
    place: "Makkah",
    ayahCount: 7,
    arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  },
  {
    id: 36,
    key: "yasin",
    name: "Ya-Sin",
    meaning: "Ya Sin",
    place: "Makkah",
    ayahCount: 83,
    arabic: "يسٓ ۚ وَٱلْقُرْءَانِ ٱلْحَكِيمِ",
    translation: "Ya, Sin. By the wise Quran.",
  },
  {
    id: 55,
    key: "rahman",
    name: "Ar-Rahman",
    meaning: "The Most Merciful",
    place: "Madinah",
    ayahCount: 78,
    arabic: "ٱلرَّحْمَٰنُ عَلَّمَ ٱلْقُرْءَانَ",
    translation: "The Most Merciful taught the Quran.",
  },
  {
    id: 67,
    key: "mulk",
    name: "Al-Mulk",
    meaning: "The Sovereignty",
    place: "Makkah",
    ayahCount: 30,
    arabic: "تَبَارَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ",
    translation: "Blessed is He in whose hand is dominion.",
  },
  {
    id: 112,
    key: "ikhlas",
    name: "Al-Ikhlas",
    meaning: "Sincerity",
    place: "Makkah",
    ayahCount: 4,
    arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
    translation: "Say, He is Allah, the One.",
  },
  {
    id: 113,
    key: "falaq",
    name: "Al-Falaq",
    meaning: "The Daybreak",
    place: "Makkah",
    ayahCount: 5,
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ",
    translation: "Say, I seek refuge in the Lord of daybreak.",
  },
  {
    id: 114,
    key: "nas",
    name: "An-Nas",
    meaning: "Mankind",
    place: "Makkah",
    ayahCount: 6,
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ",
    translation: "Say, I seek refuge in the Lord of mankind.",
  },
];

function defaultState() {
  return {
    selectedKey: surahs[0].key,
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
      selectedKey: parsed.selectedKey || surahs[0].key,
      bookmarkKey: parsed.bookmarkKey || "",
      savedKeys: Array.isArray(parsed.savedKeys) ? parsed.savedKeys : [],
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
  return surahs.find((surah) => surah.key === quranState.selectedKey) ?? surahs[0];
}

function renderSelectedSurah() {
  const surah = getSelectedSurah();
  selectedMeta.textContent = `${surah.ayahCount} ayat`;
  selectedTitle.textContent = surah.name;
  selectedSubtitle.textContent = `${surah.meaning} • ${surah.place}`;
  selectedArabic.textContent = surah.arabic;
  selectedTranslation.textContent = surah.translation;
  currentSurah.textContent = surah.name;
  bookmarkedSurah.textContent =
    surahs.find((item) => item.key === quranState.bookmarkKey)?.name ?? "None yet";
  savedCount.textContent = String(quranState.savedKeys.length);

  const bookmarked = quranState.bookmarkKey === surah.key;
  toggleBookmarkButton.textContent = bookmarked ? "Bookmarked" : "Save bookmark";
  bookmarkCopy.textContent = bookmarked
    ? `${surah.name} is your active bookmark.`
    : "Bookmarks are saved on this device.";
}

function renderSurahGrid() {
  const term = quranState.search.trim().toLowerCase();
  const filtered = surahs.filter((surah) => {
    if (!term) {
      return true;
    }

    return (
      surah.name.toLowerCase().includes(term) ||
      surah.meaning.toLowerCase().includes(term) ||
      surah.place.toLowerCase().includes(term)
    );
  });

  surahGrid.innerHTML = filtered
    .map((surah) => {
      const active = surah.key === quranState.selectedKey ? " is-active" : "";
      const saved = quranState.savedKeys.includes(surah.key) ? " is-saved" : "";

      return `
        <button class="quran-surah-card${active}${saved}" data-surah-key="${surah.key}" type="button">
          <span class="quran-surah-number">${surah.id}</span>
          <strong>${surah.name}</strong>
          <small>${surah.meaning}</small>
          <span class="quran-surah-meta">${surah.ayahCount} ayat • ${surah.place}</span>
        </button>
      `;
    })
    .join("");

  surahGrid.querySelectorAll("[data-surah-key]").forEach((button) => {
    button.addEventListener("click", () => {
      quranState.selectedKey = button.dataset.surahKey;
      quranStatus.textContent = `${getSelectedSurah().name} opened.`;
      render();
    });
  });
}

function toggleBookmark() {
  const surah = getSelectedSurah();
  quranState.bookmarkKey = surah.key;

  if (!quranState.savedKeys.includes(surah.key)) {
    quranState.savedKeys.push(surah.key);
  }

  quranStatus.textContent = `${surah.name} saved.`;
  render();
}

function openBookmark() {
  if (!quranState.bookmarkKey) {
    quranStatus.textContent = "No bookmark saved yet.";
    return;
  }

  quranState.selectedKey = quranState.bookmarkKey;
  quranStatus.textContent = `${getSelectedSurah().name} reopened.`;
  render();
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
  render();
});

clearSearchButton?.addEventListener("click", () => {
  quranState.search = "";
  quranStatus.textContent = "Search cleared.";
  render();
});

toggleBookmarkButton?.addEventListener("click", toggleBookmark);
openBookmarkButton?.addEventListener("click", openBookmark);

render();
