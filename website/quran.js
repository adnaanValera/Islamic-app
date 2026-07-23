const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
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
const previousSurahButton = document.getElementById("quran-prev-surah");
const nextSurahButton = document.getElementById("quran-next-surah");
const surahDropdown = document.getElementById("quran-surah-dropdown");
const languageButtons = Array.from(document.querySelectorAll("[data-quran-view]"));

let surahs = [];
let selectedSurahDetails = null;
let searchResults = [];
let currentArabicPageIndex = 0;

function defaultState() {
  return {
    selectedKey: "1",
    search: "",
    view: "both",
    lastReading: {
      surahKey: "1",
      pageIndex: 0,
      view: "both",
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
    const initial = defaultState();
    const savedSurahKey = String(parsed?.lastReading?.surahKey || parsed?.selectedKey || initial.selectedKey);

    return {
      selectedKey: savedSurahKey,
      search: parsed.search || "",
      view: ["arabic", "english", "both"].includes(parsed.view) ? parsed.view : initial.view,
      lastReading: {
        surahKey: savedSurahKey,
        pageIndex: Number(parsed?.lastReading?.pageIndex || 0),
        view: ["arabic", "english", "both"].includes(parsed?.lastReading?.view)
          ? parsed.lastReading.view
          : initial.view,
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

function getFilteredSurahs() {
  const term = quranState.search.trim().toLowerCase();
  if (!term) {
    return surahs;
  }

  return surahs.filter((surah) => {
    const surahNumber = String(surah.number);
    return (
      surahNumber.includes(term) ||
      surah.englishName.toLowerCase().includes(term) ||
      surah.englishNameTranslation.toLowerCase().includes(term) ||
      surah.revelationType.toLowerCase().includes(term)
    );
  });
}

function getLastReadLabel() {
  const lastSurah = surahs.find((item) => String(item.number) === quranState.lastReading.surahKey);
  if (!lastSurah) {
    return "Resumes automatically";
  }

  if (quranState.lastReading.view === "arabic") {
    return `${lastSurah.englishName} • Page ${quranState.lastReading.pageIndex + 1}`;
  }

  return `${lastSurah.englishName} • Last opened`;
}

function shouldShowBasmala(surahNumber) {
  return Number(surahNumber) !== 9;
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

function rememberCurrentReading(pageIndex = 0) {
  quranState.lastReading = {
    surahKey: quranState.selectedKey,
    pageIndex,
    view: quranState.view,
  };
  saveState();
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
  lastReadBadge.textContent = getLastReadLabel();
  readingCopy.textContent =
    quranState.view === "arabic"
      ? "Swipe left or right to move through the pages."
      : "Nooriva reopens your last surah automatically on this device.";
  if (basmalaCard) {
    basmalaCard.style.display = shouldShowBasmala(surah.number) ? "grid" : "none";
  }

  if (previousSurahButton) {
    previousSurahButton.disabled = !hasPrevious;
  }

  if (nextSurahButton) {
    nextSurahButton.disabled = !hasNext;
  }
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
      await openSurahByKey(button.dataset.surahKey, "Opening surah...");
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

function buildArabicPages(arabicAyahs) {
  const pageSize = 7;
  const pages = [];

  for (let index = 0; index < arabicAyahs.length; index += pageSize) {
    const slice = arabicAyahs.slice(index, index + pageSize);
    pages.push(`
      <article class="quran-reading-page" data-page-index="${Math.floor(index / pageSize)}">
        <div class="quran-reading-page-topline">
          <span>Page ${Math.floor(index / pageSize) + 1}</span>
        </div>
        <p class="quran-reading-page-arabic" dir="rtl" lang="ar">
          ${slice
            .map((ayah) => `${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`)
            .join(" ")}
        </p>
      </article>
    `);
  }

  return `
    <div class="quran-reading-pages-track" id="quran-reading-pages-track">
      ${pages.join("")}
    </div>
  `;
}

function buildEnglishAyahs(translationAyahs) {
  return translationAyahs
    .map(
      (ayah, index) => `
      <article class="quran-ayah-card" data-ayah-number="${index + 1}">
        <div class="quran-ayah-topline">
          <span>Ayah ${index + 1}</span>
        </div>
        <p class="quran-ayah-translation">${ayah?.text ?? ""}</p>
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
        </div>
        <div class="quran-dual-block">
          <p class="quran-dual-arabic" dir="rtl" lang="ar">
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

function updateArabicPagerUI(activeIndex, pageCount) {
  currentArabicPageIndex = activeIndex;

  const dots = Array.from(pageIndicators.querySelectorAll("[data-page-dot]"));
  dots.forEach((dot) => {
    dot.classList.toggle("is-active", Number(dot.dataset.pageDot) === activeIndex);
  });

  rememberCurrentReading(Math.min(activeIndex, Math.max(pageCount - 1, 0)));
  renderHeader();
}

function attachArabicPager() {
  const track = document.getElementById("quran-reading-pages-track");
  const pages = Array.from(track?.querySelectorAll(".quran-reading-page") ?? []);

  if (!track || pages.length === 0) {
    pageIndicators.innerHTML = "";
    return;
  }

  pageIndicators.innerHTML = pages
    .map(
      (_, index) => `
        <button
          class="quran-page-dot${index === currentArabicPageIndex ? " is-active" : ""}"
          data-page-dot="${index}"
          type="button"
          aria-label="Open Quran page ${index + 1}"
        ></button>
      `,
    )
    .join("");

  const savedIndex =
    quranState.lastReading.surahKey === quranState.selectedKey && quranState.lastReading.view === "arabic"
      ? Math.min(quranState.lastReading.pageIndex, pages.length - 1)
      : 0;

  currentArabicPageIndex = savedIndex;
  window.requestAnimationFrame(() => {
    pages[savedIndex]?.scrollIntoView({ inline: "start", block: "nearest" });
    updateArabicPagerUI(savedIndex, pages.length);
  });

  pageIndicators.querySelectorAll("[data-page-dot]").forEach((dot) => {
    dot.addEventListener("click", () => {
      const pageIndex = Number(dot.dataset.pageDot);
      pages[pageIndex]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      updateArabicPagerUI(pageIndex, pages.length);
    });
  });

  let scrollTicking = false;
  track.addEventListener("scroll", () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      const pageWidth = pages[0].getBoundingClientRect().width || 1;
      const activeIndex = Math.round(track.scrollLeft / pageWidth);
      updateArabicPagerUI(Math.max(0, Math.min(activeIndex, pages.length - 1)), pages.length);
      scrollTicking = false;
    });
  });

  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX ?? 0;
    },
    { passive: true },
  );

  track.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0]?.clientX ?? 0;
      const deltaX = touchStartX - touchEndX;
      if (Math.abs(deltaX) < 44) {
        return;
      }

      const nextIndex = deltaX > 0 ? currentArabicPageIndex + 1 : currentArabicPageIndex - 1;
      const safeIndex = Math.max(0, Math.min(nextIndex, pages.length - 1));
      pages[safeIndex]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      updateArabicPagerUI(safeIndex, pages.length);
    },
    { passive: true },
  );
}

function renderReading() {
  const surah = getSelectedSurah();
  const arabicAyahs = selectedSurahDetails?.arabicEdition?.ayahs ?? [];
  const translationAyahs = selectedSurahDetails?.translationEdition?.ayahs ?? [];

  if (!surah || arabicAyahs.length === 0 || translationAyahs.length === 0) {
    ayahList.innerHTML = `
      <article class="quran-reading-page">
        <div class="quran-reading-page-topline"><span>Loading</span></div>
        <p class="quran-reading-page-arabic" dir="rtl" lang="ar">Please wait...</p>
      </article>
    `;
    pageIndicators.innerHTML = "";
    return;
  }

  rememberCurrentReading(quranState.view === "arabic" ? quranState.lastReading.pageIndex : 0);

  if (quranState.view === "arabic") {
    ayahList.className = "quran-ayah-list quran-ayah-list-pages";
    ayahList.innerHTML = buildArabicPages(arabicAyahs);
    attachArabicPager();
    return;
  }

  pageIndicators.innerHTML = "";

  if (quranState.view === "english") {
    ayahList.className = "quran-ayah-list";
    ayahList.innerHTML = buildEnglishAyahs(translationAyahs);
    return;
  }

  ayahList.className = "quran-ayah-list";
  ayahList.innerHTML = buildBothChunks(arabicAyahs, translationAyahs);
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
  currentArabicPageIndex = 0;
  selectedSurahDetails = null;
  quranStatus.textContent = statusMessage;
  rememberCurrentReading(0);
  render();
  await loadSelectedSurahDetails();
}

async function openFirstSearchResult() {
  if (!searchResults.length) {
    quranStatus.textContent = "No surah matches that search.";
    return;
  }

  await openSurahByKey(searchResults[0].number, `Opening ${searchResults[0].englishName}...`);
  surahDropdown?.removeAttribute("open");
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

searchInput?.addEventListener("input", () => {
  quranState.search = searchInput.value;
  if (quranState.search.trim()) {
    surahDropdown?.setAttribute("open", "open");
  }
  renderSurahGrid();
  saveState();
});

searchInput?.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  await openFirstSearchResult();
});

searchInput?.addEventListener("focus", () => {
  surahDropdown?.setAttribute("open", "open");
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quranState.view = button.dataset.quranView;
    rememberCurrentReading(0);
    render();
  });
});

previousSurahButton?.addEventListener("click", async () => {
  await stepSurah(-1);
});

nextSurahButton?.addEventListener("click", async () => {
  await stepSurah(1);
});

async function initQuran() {
  try {
    quranStatus.textContent = "Loading Quran...";
    surahs = await fetchSurahList();
    renderSurahGrid();
    render();
    await loadSelectedSurahDetails();
  } catch {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

initQuran();
