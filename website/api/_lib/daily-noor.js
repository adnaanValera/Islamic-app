import { fetchAyahOfTheDay } from "./ayah-of-day.js";
import { getMalawiTimeParts } from "./prayer-data.js";
import { loadDailyNoorOverrideForDate } from "./daily-noor-store.js";

const DAILY_DUAS = [
  {
    id: "dua-knowledge",
    title: "For beneficial knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni ilma.",
    english: "My Lord, increase me in knowledge.",
    source: "Quran 20:114",
  },
  {
    id: "dua-guidance",
    title: "For a steady heart",
    arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً ۚ إِنَّكَ أَنْتَ الْوَهَّابُ",
    transliteration: "Rabbana la tuzigh qulubana baada idh hadaytana wa hab lana min ladunka rahmah, innaka antal Wahhab.",
    english: "Our Lord, do not let our hearts deviate after You have guided us, and grant us mercy from Yourself. Truly, You are the Bestower.",
    source: "Quran 3:8",
  },
  {
    id: "dua-goodness",
    title: "For goodness in both worlds",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina adhaban-nar.",
    english: "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    source: "Quran 2:201",
  },
  {
    id: "dua-relief",
    title: "For relief and mercy",
    arabic: "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin.",
    english: "There is no god but You. Glory be to You. Truly, I have been among the wrongdoers.",
    source: "Quran 21:87",
  },
  {
    id: "dua-expansion",
    title: "For ease in responsibility",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
    transliteration: "Rabbi ishrah li sadri wa yassir li amri.",
    english: "My Lord, expand for me my chest and make my task easy for me.",
    source: "Quran 20:25-26",
  },
  {
    id: "dua-needs",
    title: "For Allah's provision",
    arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
    transliteration: "Rabbi inni lima anzalta ilayya min khayrin faqir.",
    english: "My Lord, truly I am in need of whatever good You send down to me.",
    source: "Quran 28:24",
  },
  {
    id: "dua-family",
    title: "For family and righteousness",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata ayunin wajalna lil-muttaqina imama.",
    english: "Our Lord, grant us comfort in our spouses and children, and make us an example for the righteous.",
    source: "Quran 25:74",
  },
];

const DAILY_REMINDERS = [
  {
    id: "remembrance-rest",
    title: "Return your heart to Allah",
    quote: "Surely in the remembrance of Allah do hearts find rest.",
    source: "Quran 13:28",
    reflection: "Even one sincere moment of dhikr can calm a heavy heart.",
  },
  {
    id: "prayer-help",
    title: "Seek help through prayer",
    quote: "Seek help through patience and prayer.",
    source: "Quran 2:45",
    reflection: "When the day feels full, come back to salah before carrying it alone.",
  },
  {
    id: "allah-near",
    title: "Allah is near",
    quote: "When My servants ask you about Me, indeed I am near.",
    source: "Quran 2:186",
    reflection: "You do not need perfect words to turn to Allah. Begin with honesty.",
  },
  {
    id: "trust-allah",
    title: "Place your trust in Him",
    quote: "And whoever relies upon Allah, then He is sufficient for him.",
    source: "Quran 65:3",
    reflection: "Do your part gently, then leave what you cannot carry to Allah.",
  },
  {
    id: "gratitude",
    title: "Hold onto gratitude",
    quote: "If you are grateful, I will surely increase you.",
    source: "Quran 14:7",
    reflection: "A small thank you to Allah can open a big door in the heart.",
  },
  {
    id: "strive",
    title: "Keep showing up",
    quote: "Those who strive for Us - We will surely guide them to Our ways.",
    source: "Quran 29:69",
    reflection: "Allah sees effort before perfection. Keep returning.",
  },
  {
    id: "forgiveness",
    title: "Do not despair",
    quote: "Do not despair of the mercy of Allah.",
    source: "Quran 39:53",
    reflection: "A day that began far from Allah can still end near to Him.",
  },
];

const DAILY_HISTORY = [
  {
    id: "history-hira",
    title: "The first revelation in Hira",
    summary: "The mission of Prophet Muhammad ﷺ began in the Cave of Hira when the first verses of Surah Al-Alaq were revealed. It was the beginning of guidance for the Ummah.",
    source: "Sahih al-Bukhari, Book of Revelation",
  },
  {
    id: "history-hijrah",
    title: "The Hijrah to Madinah",
    summary: "The migration from Makkah to Madinah was a turning point for the Muslims. It was a journey of trust, sacrifice, and building a faithful community.",
    source: "Seerah works and Sahih reports on the Hijrah",
  },
  {
    id: "history-badr",
    title: "Victory at Badr",
    summary: "At Badr, Allah gave the believers a decisive victory despite their small numbers. It remains a reminder that help comes from Allah, not from strength alone.",
    source: "Quran 3:123 and seerah reports",
  },
  {
    id: "history-hudaybiyyah",
    title: "The Treaty of Hudaybiyyah",
    summary: "What first seemed difficult became a clear opening. Hudaybiyyah teaches patience, wisdom, and trust in Allah's plan.",
    source: "Quran 48 and seerah reports",
  },
  {
    id: "history-fath-makkah",
    title: "The opening of Makkah",
    summary: "When Makkah was opened, the Prophet ﷺ entered with humility and mercy. It remains one of the clearest examples of strength joined with forgiveness.",
    source: "Seerah reports on Fath Makkah",
  },
  {
    id: "history-quran-compilation",
    title: "Preserving the Quran",
    summary: "After the Prophet ﷺ, the companions carefully gathered and preserved the Quran in written form, protecting it for future generations.",
    source: "Sahih al-Bukhari, virtues of the Quran and compilation reports",
  },
  {
    id: "history-farewell-sermon",
    title: "The Farewell Sermon",
    summary: "In his final sermon, the Prophet ﷺ reminded the Ummah about justice, mercy, trust, and holding firmly to Allah's guidance.",
    source: "Farewell sermon reports in seerah and hadith collections",
  },
];

const COMPANION_REMINDERS = {
  morning: {
    title: "A new day from Allah",
    body: "Alhamdulillah, Allah has given you another day. Begin it remembering Him.",
    url: "/index.html",
  },
  night: {
    title: "End the day with gratitude",
    body: "Before you sleep, take a moment to thank Allah and return your heart to Him.",
    url: "/index.html",
  },
};

function getSeedIndex(seedSource, length, salt = "") {
  let seed = 0;

  for (const character of `${seedSource}:${salt}`) {
    seed = (seed * 33 + character.charCodeAt(0)) % length;
  }

  return seed % length;
}

export function getDailyDua(dateKey) {
  return DAILY_DUAS[getSeedIndex(dateKey, DAILY_DUAS.length, "dua")];
}

export function getDailyReminder(dateKey) {
  return DAILY_REMINDERS[getSeedIndex(dateKey, DAILY_REMINDERS.length, "reminder")];
}

export function getDailyHistory(dateKey) {
  return DAILY_HISTORY[getSeedIndex(dateKey, DAILY_HISTORY.length, "history")];
}

export async function getDailyNoorPayload(date = new Date()) {
  const { dateKey } = getMalawiTimeParts(date);
  const [ayah] = await Promise.all([fetchAyahOfTheDay(date)]);
  const override = await loadDailyNoorOverrideForDate(dateKey);

  return {
    dateKey,
    ayah: {
      ...ayah,
      ...(override?.ayah ?? {}),
    },
    dua: {
      ...getDailyDua(dateKey),
      ...(override?.dua ?? {}),
    },
    reminder: {
      ...getDailyReminder(dateKey),
      ...(override?.reminder ?? {}),
    },
    history: {
      ...getDailyHistory(dateKey),
      ...(override?.history ?? {}),
    },
    overrideUpdatedAt: override?.updatedAt ?? null,
  };
}

export function getCompanionReminderSlots(prayers, dateKey, currentMinutes, windowMinutes = 10) {
  const due = [];
  const lowerBound = Math.max(currentMinutes - Math.max(windowMinutes, 1), 0);

  const fixedMoments = [
    { key: "morning", minutes: 5 * 60 + 30 },
    { key: "night", minutes: 20 * 60 + 30 },
  ];

  for (const moment of fixedMoments) {
    if (moment.minutes >= lowerBound && moment.minutes <= currentMinutes) {
      due.push({
        slotKey: `${dateKey}:companion:${moment.key}`,
        ...COMPANION_REMINDERS[moment.key],
      });
    }
  }

  for (const prayer of prayers) {
    const [hours, minutes] = String(prayer.salah || "").split(":").map((part) => Number.parseInt(part, 10));

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      continue;
    }

    const triggerMinutes = hours * 60 + minutes - 15;
    if (triggerMinutes >= lowerBound && triggerMinutes <= currentMinutes) {
      due.push({
        slotKey: `${dateKey}:before-salah:${prayer.label}:${prayer.salah}`,
        title: `${prayer.label} is approaching`,
        body: "Your next meeting with Allah is approaching.",
        url: "/prayer.html",
        prayer: prayer.label,
      });
    }
  }

  return due;
}
