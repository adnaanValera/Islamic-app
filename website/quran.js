const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
const totalQuranPages = 604;
const basmalaText = "\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u0670\u0647\u0650 \u0671\u0644\u0631\u064e\u0651\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u064e\u0651\u062d\u0650\u064a\u0645\u0650";

const surahGrid = document.getElementById("quran-surah-grid");
const ayahList = document.getElementById("quran-ayah-list");
const pageIndicators = document.getElementById("quran-page-indicators");
const searchInput = document.getElementById("quran-search");
const quranStatus = document.getElementById("quran-status");
const readingCopy = document.getElementById("quran-reading-copy");
const selectedMeta = document.getElementById("quran-selected-meta");
const selectedTitle = document.getElementById("quran-selected-title");
const selectedSubtitle = document.getElementById("quran-selected-subtitle");
const currentSurah = document.getElementById("quran-current-surah");
const lastReadBadge = document.getElementById("quran-last-read");
const basmalaCard = document.getElementById("quran-basmala-card");
const basmalaTextNode = document.getElementById("quran-basmala-text");
const previousSurahButton = document.getElementById("quran-prev-surah");
const nextSurahButton = document.getElementById("quran-next-surah");
const surahDropdown = document.getElementById("quran-surah-dropdown");
const languageButtons = Array.from(document.querySelectorAll("[data-quran-view]"));

let surahs = [];
let searchResults = [];
let currentPageData = null;
let currentPageNumber = 1;
const pageCache = new Map();
const surahStartPageCache = new Map();
let touchStartX = 0;
let touchStartY = 0;
let isNavigating = false;

function defaultState() {
  return {
    selectedKey: "1",
    search: "",
    view: "both",
    currentPage: 1,
    lastReading: {
      surahKey: "1",
      page: 1,
      view: "both",
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(quranStorageKey);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    return {
      selectedKey: String(parsed?.selectedKey || parsed?.lastReading?.surahKey || "1"),
      search: parsed?.search || "",
      view: ["arabic", "english", "both"].includes(parsed?.view) ? parsed.view : "both",
      currentPage: Math.max(1, Math.min(Number(parsed?.currentPage || parsed?.lastReading?.page || 1), totalQuranPages)),
      lastReading: {
        surahKey: String(parsed?.lastReading?.surahKey || parsed?.selectedKey || "1"),
        page: Math.max(1, Math.min(Number(parsed?.lastReading?.page || parsed?.currentPage || 1), totalQuranPages)),
        view: ["arabic", "english", "both"].includes(parsed?.lastReading?.view) ? parsed.lastReading.view : "both",
      },
    };
  } catch {
    return defaultState();
  }
}

let quranState = loadState();
currentPageNumber = quranState.currentPage;

function saveState() {
  localStorage.setItem(quranStorageKey, JSON.stringify({ ...quranState, currentPage: currentPageNumber }));
}

function sanitizeArabicText(text) {
  return String(text || "").replace(/^\uFEFF/, "").trim();
}

function getFilteredSurahs() {
  const term = quranState.search.trim().toLowerCase();
  if (!term) return surahs;

  return surahs.filter((surah) => {
    const number = String(surah.number);
    return (
      number.includes(term) ||
      surah.englishName.toLowerCase().includes(term) ||
      surah.englishNameTranslation.toLowerCase().includes(term) ||
      surah.revelationType.toLowerCase().includes(term)
    );
  });
}

function rememberCurrentReading(surahKey, pageNumber) {
  quranState.selectedKey = String(surahKey);
  quranState.currentPage = pageNumber;
  quranState.lastReading = {
    surahKey: String(surahKey),
    page: pageNumber,
    view: quranState.view,
  };
  currentPageNumber = pageNumber;
  saveState();
}

async function fetchSurahList() {
  const response = await fetch(`${quranApiBaseUrl}/surah`, { cache: "force-cache" });
  if (!response.ok) throw new Error("Unable to load Quran surahs.");
  const payload = await response.json();
  return payload?.data ?? [];
}

async function fetchPage(pageNumber) {
  const cacheKey = `${pageNumber}:${quranState.view}`;
  if (pageCache.has(cacheKey)) return pageCache.get(cacheKey);

  const edition =
    quranState.view === "arabic" ? "quran-uthmani" : quranState.view === "english" ? "en.sahih" : "quran-uthmani,en.sahih";
  const response = await fetch(`${quranApiBaseUrl}/page/${pageNumber}/${edition}`, { cache: "force-cache" });
  if (!response.ok) throw new Error("Unable to load Quran page.");
  const payload = await response.json();
  const data = payload?.data ?? {};
  pageCache.set(cacheKey, data);
  return data;
}

async function fetchSurahStartPage(surahNumber) {
  const numericSurah = Number(surahNumber);
  if (surahStartPageCache.has(numericSurah)) return surahStartPageCache.get(numericSurah);

  const response = await fetch(`${quranApiBaseUrl}/surah/${numericSurah}/quran-uthmani`, { cache: "force-cache" });
  if (!response.ok) throw new Error("Unable to load surah start.");
  const payload = await response.json();
  const firstAyahPage = payload?.data?.ayahs?.[0]?.page ?? 1;
  surahStartPageCache.set(numericSurah, firstAyahPage);
  return firstAyahPage;
}

function getCurrentSurahFromPageData(pageData) {
  const pageAyahs = Array.isArray(pageData?.ayahs) ? pageData.ayahs : [];
  return pageAyahs[0]?.surah ?? surahs[0] ?? null;
}

function shouldShowBasmala(pageData) {
  const surah = getCurrentSurahFromPageData(pageData);
  return Number(surah?.number) !== 9;
}

function renderHeader() {
  const surah = getCurrentSurahFromPageData(currentPageData);
  if (!surah) return;

  const activeIndex = surahs.findIndex((item) => Number(item.number) === Number(surah.number));
  currentSurah.textContent = `${surah.number}. ${surah.englishName}`;
  if (selectedTitle) selectedTitle.textContent = "Quran";
  if (selectedSubtitle) selectedSubtitle.textContent = "";
  if (selectedMeta) selectedMeta.textContent = "";
  if (lastReadBadge) lastReadBadge.textContent = "";
  if (readingCopy) readingCopy.textContent = "";

  if (previousSurahButton) previousSurahButton.disabled = activeIndex <= 0 || isNavigating;
  if (nextSurahButton) nextSurahButton.disabled = activeIndex === -1 || activeIndex >= surahs.length - 1 || isNavigating;
}

function renderSurahGrid() {
  searchResults = getFilteredSurahs();
  if (searchResults.length === 0) {
    surahGrid.innerHTML = `
      <div class="quran-surah-empty">
        <strong>No surah found</strong>
        <small>Try another name or surah number.</small>
      </div>
    `;
    return;
  }

  surahGrid.innerHTML = searchResults
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
      await jumpToSurah(button.dataset.surahKey);
      surahDropdown?.removeAttribute("open");
      searchInput?.blur();
    });
  });
}

function renderViewButtons() {
  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.quranView === quranState.view);
  });
}

function buildArabicPage(pageData) {
  const ayahs = Array.isArray(pageData?.ayahs) ? pageData.ayahs : [];
  const surah = getCurrentSurahFromPageData(pageData);
  const basmalaMarkup = shouldShowBasmala(pageData)
    ? `
      <div class="quran-page-basmala">
        <p class="quran-basmala-label">Bismillah</p>
        <p class="quran-basmala-text" dir="rtl" lang="ar">${basmalaText}</p>
      </div>
    `
    : "";

  return `
    <article class="quran-reading-page quran-reading-page-premium quran-reading-page-paged">
      <div class="quran-reading-page-ornament quran-reading-page-ornament-top" aria-hidden="true"></div>
      <div class="quran-reading-page-surah-name">${surah?.englishName ?? ""}</div>
      <div class="quran-reading-page-topline"><span>Page ${pageData?.number ?? currentPageNumber}</span></div>
      ${basmalaMarkup}
      <p class="quran-reading-page-arabic" dir="rtl" lang="ar">
        ${ayahs.map((ayah) => `${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`).join(" ")}
      </p>
      <div class="quran-reading-page-ornament quran-reading-page-ornament-bottom" aria-hidden="true"></div>
    </article>
  `;
}

function buildEnglishPage(pageData) {
  const ayahs = Array.isArray(pageData?.ayahs) ? pageData.ayahs : [];
  return ayahs
    .map(
      (ayah) => `
        <article class="quran-ayah-card quran-ayah-card-premium">
          <div class="quran-ayah-card-accent" aria-hidden="true"></div>
          <div class="quran-ayah-topline"><span>Ayah ${ayah.numberInSurah}</span></div>
          <p class="quran-ayah-translation">${ayah.text}</p>
        </article>
      `,
    )
    .join("");
}

function buildBothPage(pageData) {
  const ayahs = Array.isArray(pageData?.ayahs) ? pageData.ayahs : [];
  return ayahs
    .map(
      (ayah) => `
        <article class="quran-ayah-card quran-ayah-card-premium quran-ayah-card-both">
          <div class="quran-ayah-card-accent" aria-hidden="true"></div>
          <div class="quran-ayah-topline"><span>Ayah ${ayah.numberInSurah}</span></div>
          <p class="quran-dual-arabic quran-dual-arabic-single" dir="rtl" lang="ar">${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span></p>
          <p class="quran-ayah-translation">${ayah.secondaryText ?? ""}</p>
        </article>
      `,
    )
    .join("");
}

function renderPageIndicators() {
  pageIndicators.innerHTML = `
    <button class="quran-page-step" id="quran-page-prev" type="button" ${currentPageNumber <= 1 || isNavigating ? "disabled" : ""}>Prev page</button>
    <span class="quran-page-counter">Page ${currentPageNumber} of ${totalQuranPages}</span>
    <button class="quran-page-step" id="quran-page-next" type="button" ${currentPageNumber >= totalQuranPages || isNavigating ? "disabled" : ""}>Next page</button>
  `;

  document.getElementById("quran-page-prev")?.addEventListener("click", async () => {
    await goToPage(currentPageNumber - 1);
  });
  document.getElementById("quran-page-next")?.addEventListener("click", async () => {
    await goToPage(currentPageNumber + 1);
  });
}

function attachSwipeHandlers() {
  ayahList.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
      touchStartY = event.changedTouches[0]?.clientY ?? 0;
    },
    { passive: true },
  );

  ayahList.addEventListener(
    "touchend",
    async (event) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? 0;
      const touchEndY = event.changedTouches[0]?.clientY ?? 0;
      const deltaX = touchStartX - touchEndX;
      const deltaY = touchStartY - touchEndY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < 44 || isNavigating) return;
      await goToPage(deltaX > 0 ? currentPageNumber + 1 : currentPageNumber - 1);
    },
    { passive: true },
  );
}

function renderReading() {
  if (!currentPageData) {
    ayahList.innerHTML = `
      <article class="quran-reading-page quran-reading-page-premium quran-reading-page-paged">
        <div class="quran-reading-page-topline"><span>Loading</span></div>
        <p class="quran-reading-page-arabic" dir="rtl" lang="ar">Please wait...</p>
      </article>
    `;
    pageIndicators.innerHTML = "";
    return;
  }

  if (quranState.view === "arabic") {
    ayahList.className = "quran-ayah-list quran-ayah-list-pages";
    ayahList.innerHTML = buildArabicPage(currentPageData);
  } else if (quranState.view === "english") {
    ayahList.className = "quran-ayah-list";
    ayahList.innerHTML = buildEnglishPage(currentPageData);
  } else {
    ayahList.className = "quran-ayah-list";
    ayahList.innerHTML = buildBothPage(currentPageData);
  }

  renderPageIndicators();
}

function render() {
  if (searchInput) searchInput.value = quranState.search;
  renderHeader();
  renderViewButtons();
  renderSurahGrid();
  renderReading();
  saveState();
}

async function goToPage(pageNumber, forceReload = false) {
  const safePage = Math.max(1, Math.min(pageNumber, totalQuranPages));
  if (!forceReload && safePage === currentPageNumber && currentPageData) return;

  try {
    isNavigating = true;
    quranStatus.textContent = "Loading page...";
    renderHeader();
    renderPageIndicators();

    let pageData = await fetchPage(safePage);
    currentPageNumber = safePage;

    if (quranState.view === "both") {
      const englishPage = await fetch(`${quranApiBaseUrl}/page/${safePage}/en.sahih`, { cache: "force-cache" }).then((r) => r.json());
      const englishAyahs = englishPage?.data?.ayahs ?? [];
      pageData = {
        ...pageData,
        ayahs: pageData.ayahs.map((ayah, index) => ({
          ...ayah,
          secondaryText: englishAyahs[index]?.text ?? "",
        })),
      };
    }

    currentPageData = pageData;
    const pageSurah = getCurrentSurahFromPageData(currentPageData);
    rememberCurrentReading(pageSurah?.number ?? quranState.selectedKey, safePage);
    quranStatus.textContent = "";
    render();
  } catch {
    quranStatus.textContent = "We couldn't load that page just now.";
  } finally {
    isNavigating = false;
    renderHeader();
    renderPageIndicators();
  }
}

async function jumpToSurah(surahKey) {
  const pageNumber = await fetchSurahStartPage(surahKey);
  await goToPage(pageNumber, true);
}

searchInput?.addEventListener("input", () => {
  quranState.search = searchInput.value;
  if (quranState.search.trim()) surahDropdown?.setAttribute("open", "open");
  renderSurahGrid();
  saveState();
});

searchInput?.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (searchResults.length) {
    await jumpToSurah(searchResults[0].number);
    surahDropdown?.removeAttribute("open");
  } else {
    quranStatus.textContent = "No surah matches that search.";
  }
});

searchInput?.addEventListener("focus", () => {
  surahDropdown?.setAttribute("open", "open");
});

languageButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    quranState.view = button.dataset.quranView;
    pageCache.clear();
    await goToPage(currentPageNumber, true);
  });
});

previousSurahButton?.addEventListener("click", async () => {
  const pageSurah = getCurrentSurahFromPageData(currentPageData);
  const currentIndex = surahs.findIndex((surah) => Number(surah.number) === Number(pageSurah?.number));
  if (currentIndex > 0) {
    await jumpToSurah(surahs[currentIndex - 1].number);
  }
});

nextSurahButton?.addEventListener("click", async () => {
  const pageSurah = getCurrentSurahFromPageData(currentPageData);
  const currentIndex = surahs.findIndex((surah) => Number(surah.number) === Number(pageSurah?.number));
  if (currentIndex !== -1 && currentIndex < surahs.length - 1) {
    await jumpToSurah(surahs[currentIndex + 1].number);
  }
});

async function initQuran() {
  try {
    quranStatus.textContent = "Loading Quran...";
    surahs = await fetchSurahList();
    renderSurahGrid();
    attachSwipeHandlers();
    await goToPage(currentPageNumber, true);
  } catch {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

initQuran();
