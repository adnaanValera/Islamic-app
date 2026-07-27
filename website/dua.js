const duaSearchInput = document.getElementById("dua-search");
const duaList = document.getElementById("dua-list");
const duaStatus = document.getElementById("dua-status");

const duas = [
  {
    id: "before-eating",
    title: "Before eating",
    keywords: ["food", "meal", "bismillah", "eat"],
    arabic: "بِسْمِ ٱللَّٰهِ",
    english: "In the name of Allah.",
  },
  {
    id: "after-eating",
    title: "After eating",
    keywords: ["food", "meal", "thanks", "eat"],
    arabic: "ٱلْحَمْدُ لِلَّٰهِ ٱلَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ ٱلْمُسْلِمِينَ",
    english: "All praise is for Allah who fed us, gave us drink, and made us among the Muslims.",
  },
  {
    id: "before-sleep",
    title: "Before sleeping",
    keywords: ["sleep", "night", "bed"],
    arabic: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    english: "O Allah, in Your name I die and I live.",
  },
  {
    id: "after-waking",
    title: "After waking up",
    keywords: ["wake", "morning", "sleep"],
    arabic: "ٱلْحَمْدُ لِلَّٰهِ ٱلَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ ٱلنُّشُورُ",
    english: "All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.",
  },
  {
    id: "entering-house",
    title: "Entering the house",
    keywords: ["home", "house", "enter"],
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    english: "O Allah, I ask You for the best entrance and the best exit. In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.",
  },
  {
    id: "leaving-house",
    title: "Leaving the house",
    keywords: ["home", "house", "leave", "travel"],
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    english: "In the name of Allah, I place my trust in Allah, and there is no power and no strength except with Allah.",
  },
  {
    id: "entering-masjid",
    title: "Entering the masjid",
    keywords: ["mosque", "masjid", "enter", "prayer"],
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    english: "O Allah, open for me the doors of Your mercy.",
  },
  {
    id: "leaving-masjid",
    title: "Leaving the masjid",
    keywords: ["mosque", "masjid", "leave", "prayer"],
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    english: "O Allah, I ask You from Your bounty.",
  },
  {
    id: "entering-toilet",
    title: "Before entering the toilet",
    keywords: ["toilet", "bathroom", "restroom"],
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    english: "O Allah, I seek refuge in You from the male and female devils.",
  },
  {
    id: "leaving-toilet",
    title: "After leaving the toilet",
    keywords: ["toilet", "bathroom", "restroom"],
    arabic: "غُفْرَانَكَ",
    english: "I seek Your forgiveness.",
  },
  {
    id: "increasing-knowledge",
    title: "For increasing knowledge",
    keywords: ["knowledge", "study", "learn", "school"],
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    english: "My Lord, increase me in knowledge.",
  },
  {
    id: "for-parents",
    title: "For parents",
    keywords: ["mother", "father", "parents", "family"],
    arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    english: "My Lord, have mercy upon them as they brought me up when I was small.",
  },
  {
    id: "forgiveness",
    title: "Seeking forgiveness",
    keywords: ["astaghfirullah", "forgive", "sins", "repentance"],
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    english: "I seek forgiveness from Allah.",
  },
  {
    id: "gratitude",
    title: "On receiving good news",
    keywords: ["thanks", "gratitude", "good news", "happy"],
    arabic: "الْحَمْدُ لِلَّهِ",
    english: "All praise is for Allah.",
  },
  {
    id: "travel",
    title: "Travel dua",
    keywords: ["car", "journey", "transport", "drive", "travel"],
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    english: "Glory is to the One who has subjected this for us, and we could not have done so by ourselves, and surely to our Lord we are returning.",
  },
  {
    id: "mirror",
    title: "Looking in the mirror",
    keywords: ["mirror", "appearance"],
    arabic: "اللَّهُمَّ كَمَا أَحْسَنْتَ خَلْقِي فَأَحْسِنْ خُلُقِي",
    english: "O Allah, just as You have made my outward form beautiful, make my character beautiful too.",
  },
  {
    id: "sneeze",
    title: "After sneezing",
    keywords: ["sneeze", "health"],
    arabic: "الْحَمْدُ لِلَّهِ",
    english: "All praise is for Allah.",
  },
  {
    id: "reply-sneeze",
    title: "Reply to someone who sneezed",
    keywords: ["sneeze", "reply", "yarhamukallah"],
    arabic: "يَرْحَمُكَ اللَّهُ",
    english: "May Allah have mercy on you.",
  },
  {
    id: "anxiety",
    title: "For worry and difficulty",
    keywords: ["hardship", "stress", "anxiety", "problem", "difficulty"],
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    english: "Allah is sufficient for us, and He is the best disposer of affairs.",
  },
  {
    id: "fasting",
    title: "When breaking fast",
    keywords: ["ramadan", "iftar", "fast", "breaking fast"],
    arabic: "اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    english: "O Allah, for You I fasted, in You I believe, upon You I rely, and with Your provision I break my fast.",
  },
  {
    id: "wudhu-after",
    title: "After wudhu",
    keywords: ["wudu", "wudhu", "ablution", "purification"],
    arabic: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    english: "I bear witness that there is no god except Allah alone without partner, and I bear witness that Muhammad is His servant and messenger.",
  },
];

let currentSearch = "";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getFilteredDuas() {
  const term = normalizeText(currentSearch);

  if (!term) {
    return duas;
  }

  return duas.filter((dua) => {
    const haystack = [
      dua.title,
      dua.english,
      dua.arabic,
      ...(dua.keywords || []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

function renderDuas() {
  if (!duaList) {
    return;
  }

  const filteredDuas = getFilteredDuas();

  if (duaStatus) {
    duaStatus.textContent = filteredDuas.length
      ? `${filteredDuas.length} dua${filteredDuas.length === 1 ? "" : "s"}`
      : "No duas found.";
  }

  if (!filteredDuas.length) {
    duaList.innerHTML = `
      <article class="dua-empty-state">
        <strong>No dua found</strong>
        <p>Try another name or keyword.</p>
      </article>
    `;
    return;
  }

  duaList.innerHTML = filteredDuas
    .map(
      (dua) => `
        <details class="dua-card" ${currentSearch ? "open" : ""}>
          <summary class="dua-card-summary">
            <span class="dua-card-title-wrap">
              <strong>${dua.title}</strong>
              <small>${dua.keywords.slice(0, 2).join(" • ")}</small>
            </span>
            <span class="dua-card-arrow" aria-hidden="true"></span>
          </summary>
          <div class="dua-card-body">
            <p class="dua-card-arabic" dir="rtl" lang="ar">${dua.arabic}</p>
            <p class="dua-card-english">${dua.english}</p>
          </div>
        </details>
      `,
    )
    .join("");
}

duaSearchInput?.addEventListener("input", () => {
  currentSearch = duaSearchInput.value;
  renderDuas();
});

if (duaStatus) {
  duaStatus.textContent = "Loading duas...";
}

renderDuas();
