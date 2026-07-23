const quranStorageKey = "nooriva-quran-state";
const quranApiBaseUrl = "https://api.alquran.cloud/v1";
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

function defaultState() {
  return {
    selectedKey: "1",
    search: "",
    view: "both",
    lastReading: {
      surahKey: "1",
      view: "both",
    },
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(quranStorageKey);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    const selectedKey = String(parsed?.lastReading?.surahKey || parsed?.selectedKey || "1");

    return {
      selectedKey,
      search: parsed.search || "",
      view: ["arabic", "english", "both"].includes(parsed.view) ? parsed.view : "both",
      lastReading: {
        surahKey: selectedKey,
        view: ["arabic", "english", "both"].includes(parsed?.lastReading?.view)
          ? parsed.lastReading.view
          : "both",
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

function getLastReadLabel() {
  const lastSurah = getSelectedSurah();
  if (!lastSurah) return "Resumes automatically";
  return `${lastSurah.englishName} • Last opened`;
}

function sanitizeArabicText(text) {
  return String(text || "").replace(/^\uFEFF/, "").trim();
}

async function fetchFullQuran() {
  const response = await fetch(`${quranApiBaseUrl}/quran/quran-uthmani,en.sahih`, { cache: "force-cache" });
  if (!response.ok) throw new Error("Unable to load the Quran.");
  const payload = await response.json();
  return payload?.data?.surahs ?? [];
}

function rememberCurrentReading(surahKey) {
  quranState.selectedKey = String(surahKey);
  quranState.lastReading = {
    surahKey: String(surahKey),
    view: quranState.view,
  };
  saveState();
}

function renderHeader() {
  const surah = getSelectedSurah();
  if (!surah) return;

  const activeIndex = surahs.findIndex((item) => String(item.number) === String(surah.number));
  selectedTitle.textContent = surah.englishName;
  selectedSubtitle.textContent = `${surah.englishNameTranslation} • ${surah.revelationType}`;
  selectedMeta.textContent = `${surah.numberOfAyahs} ayat`;
  currentSurah.textContent = surah.englishName;
  lastReadBadge.textContent = getLastReadLabel();
  readingCopy.textContent =
    quranState.view === "arabic"
      ? "The full Quran flows continuously. Search jumps you to a surah."
      : "The full Quran flows continuously. Search jumps you to a surah.";

  if (basmalaTextNode) basmalaTextNode.textContent = basmalaText;
  if (basmalaCard) basmalaCard.style.display = "grid";
  if (previousSurahButton) previousSurahButton.disabled = activeIndex <= 0;
  if (nextSurahButton) nextSurahButton.disabled = activeIndex === -1 || activeIndex >= surahs.length - 1;
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
    button.addEventListener("click", () => {
      jumpToSurah(button.dataset.surahKey);
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

function buildArabicPages() {
  const pages = new Map();

  surahs.forEach((surah) => {
    surah.ayahs.forEach((ayah, index) => {
      const pageNumber = ayah.page;
      if (!pages.has(pageNumber)) {
        pages.set(pageNumber, []);
      }

      pages.get(pageNumber).push({
        surahNumber: surah.number,
        surahName: surah.englishName,
        isFirstAyahOfSurah: index === 0,
        text: sanitizeArabicText(ayah.text),
        numberInSurah: ayah.numberInSurah,
      });
    });
  });

  return Array.from(pages.entries())
    .map(([pageNumber, ayahs]) => {
      const firstSurahNumber = ayahs[0]?.surahNumber ?? 1;
      const firstSurah = surahs.find((surah) => surah.number === firstSurahNumber);
      return `
        <article class="quran-reading-page quran-reading-page-premium" data-page-number="${pageNumber}" data-surah-anchor="${firstSurahNumber}" id="surah-anchor-${firstSurahNumber}">
          <div class="quran-reading-page-ornament quran-reading-page-ornament-top" aria-hidden="true"></div>
          <div class="quran-reading-page-topline">
            <span>Page ${pageNumber}</span>
          </div>
          <div class="quran-page-surah-chip">${firstSurah?.englishName ?? ""}</div>
          <p class="quran-reading-page-arabic" dir="rtl" lang="ar">
            ${ayahs
              .map((ayah) => `${ayah.isFirstAyahOfSurah ? `<span class="quran-surah-break">${ayah.surahName}</span> ` : ""}${ayah.text} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`)
              .join(" ")}
          </p>
          <div class="quran-reading-page-ornament quran-reading-page-ornament-bottom" aria-hidden="true"></div>
        </article>
      `;
    })
    .join("");
}

function buildEnglishSections() {
  return surahs
    .map(
      (surah) => `
        <section class="quran-surah-section quran-surah-section-premium" id="surah-anchor-${surah.number}" data-surah-anchor="${surah.number}">
          <div class="quran-surah-section-head">
            <span class="quran-surah-section-number">Surah ${surah.number}</span>
            <h2>${surah.englishName}</h2>
            <p>${surah.englishNameTranslation} • ${surah.revelationType}</p>
          </div>
          <div class="quran-surah-section-list">
            ${surah.ayahs
              .map(
                (ayah) => `
                  <article class="quran-ayah-card quran-ayah-card-premium">
                    <div class="quran-ayah-card-accent" aria-hidden="true"></div>
                    <div class="quran-ayah-topline"><span>Ayah ${ayah.numberInSurah}</span></div>
                    <p class="quran-ayah-translation">${ayah.text}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");
}

function buildBothSections() {
  return surahs
    .map((surah) => {
      const chunks = [];
      for (let index = 0; index < surah.ayahs.length; index += 3) {
        const arabicSlice = surah.ayahs.slice(index, index + 3);
        const englishSlice = surah.ayahs.slice(index, index + 3);
        const startAyah = arabicSlice[0]?.numberInSurah ?? 1;
        const endAyah = arabicSlice[arabicSlice.length - 1]?.numberInSurah ?? startAyah;

        chunks.push(`
          <article class="quran-ayah-card quran-ayah-card-dual quran-ayah-card-premium">
            <div class="quran-ayah-card-accent" aria-hidden="true"></div>
            <div class="quran-ayah-topline"><span>Ayah ${startAyah}${endAyah !== startAyah ? `-${endAyah}` : ""}</span></div>
            <div class="quran-dual-block">
              <p class="quran-dual-arabic" dir="rtl" lang="ar">
                ${arabicSlice.map((ayah) => `${sanitizeArabicText(ayah.text)} <span class="quran-inline-ayah">${ayah.numberInSurah}</span>`).join(" ")}
              </p>
              <div class="quran-dual-translation">
                ${englishSlice
                  .map((ayah) => `<p><strong>${ayah.numberInSurah}.</strong> ${ayah.text}</p>`)
                  .join("")}
              </div>
            </div>
          </article>
        `);
      }

      return `
        <section class="quran-surah-section quran-surah-section-premium" id="surah-anchor-${surah.number}" data-surah-anchor="${surah.number}">
          <div class="quran-surah-section-head">
            <span class="quran-surah-section-number">Surah ${surah.number}</span>
            <h2>${surah.englishName}</h2>
            <p>${surah.englishNameTranslation} • ${surah.revelationType}</p>
          </div>
          <div class="quran-surah-section-list">
            ${chunks.join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderReading() {
  if (!surahs.length) {
    ayahList.innerHTML = `
      <article class="quran-reading-page quran-reading-page-premium">
        <div class="quran-reading-page-topline"><span>Loading</span></div>
        <p class="quran-reading-page-arabic" dir="rtl" lang="ar">Please wait...</p>
      </article>
    `;
    pageIndicators.innerHTML = "";
    return;
  }

  if (quranState.view === "arabic") {
    ayahList.className = "quran-ayah-list quran-ayah-list-pages";
    ayahList.innerHTML = buildArabicPages();
    pageIndicators.innerHTML = "";
    return;
  }

  pageIndicators.innerHTML = "";
  ayahList.className = "quran-ayah-list";
  ayahList.innerHTML = quranState.view === "english" ? buildEnglishSections() : buildBothSections();
}

function jumpToSurah(surahKey) {
  rememberCurrentReading(surahKey);
  renderHeader();
  renderSurahGrid();

  const target = document.getElementById(`surah-anchor-${surahKey}`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    quranStatus.textContent = `${getSelectedSurah()?.englishName ?? "Surah"} opened.`;
  }
}

function render() {
  if (searchInput) searchInput.value = quranState.search;
  renderHeader();
  renderViewButtons();
  renderSurahGrid();
  renderReading();
  saveState();
}

searchInput?.addEventListener("input", () => {
  quranState.search = searchInput.value;
  if (quranState.search.trim()) surahDropdown?.setAttribute("open", "open");
  renderSurahGrid();
  saveState();
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (searchResults.length) {
    jumpToSurah(searchResults[0].number);
    surahDropdown?.removeAttribute("open");
  } else {
    quranStatus.textContent = "No surah matches that search.";
  }
});

searchInput?.addEventListener("focus", () => {
  surahDropdown?.setAttribute("open", "open");
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quranState.view = button.dataset.quranView;
    render();
    window.requestAnimationFrame(() => jumpToSurah(quranState.selectedKey));
  });
});

previousSurahButton?.addEventListener("click", () => {
  const currentIndex = surahs.findIndex((surah) => String(surah.number) === quranState.selectedKey);
  if (currentIndex > 0) {
    jumpToSurah(surahs[currentIndex - 1].number);
  }
});

nextSurahButton?.addEventListener("click", () => {
  const currentIndex = surahs.findIndex((surah) => String(surah.number) === quranState.selectedKey);
  if (currentIndex !== -1 && currentIndex < surahs.length - 1) {
    jumpToSurah(surahs[currentIndex + 1].number);
  }
});

async function initQuran() {
  try {
    quranStatus.textContent = "Loading Quran...";
    surahs = await fetchFullQuran();
    render();
    window.requestAnimationFrame(() => jumpToSurah(quranState.selectedKey));
  } catch {
    quranStatus.textContent = "We couldn't load the Quran just now.";
  }
}

initQuran();
