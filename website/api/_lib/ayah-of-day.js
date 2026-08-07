import { getMalawiTimeParts } from "./prayer-data.js";

const AYAH_COLLECTION = [
  {
    reference: "2:152",
    reflection: "Remembering Allah is not only for calm moments. It is how a believer keeps the heart alive throughout the day.",
    source: "Quran 2:152",
  },
  {
    reference: "2:186",
    reflection: "This ayah gently reminds us that dua does not require distance or ceremony. Allah is already near.",
    source: "Quran 2:186",
  },
  {
    reference: "2:286",
    reflection: "Allah knows the weight each soul can carry. This is a verse of hope when the day feels heavy.",
    source: "Quran 2:286",
  },
  {
    reference: "3:139",
    reflection: "The believer may feel weak for a moment, but honour stays with the heart that remains attached to Allah.",
    source: "Quran 3:139",
  },
  {
    reference: "3:173",
    reflection: "Reliance upon Allah is not passivity. It is a brave heart that still trusts Him after effort.",
    source: "Quran 3:173",
  },
  {
    reference: "13:28",
    reflection: "The heart keeps searching for rest until it settles in the remembrance of Allah.",
    source: "Quran 13:28",
  },
  {
    reference: "14:7",
    reflection: "Shukr is not only words. It is noticing Allah's gifts and letting that gratitude change your day.",
    source: "Quran 14:7",
  },
  {
    reference: "20:114",
    reflection: "A Muslim never outgrows the need to ask Allah for beneficial knowledge and sincere understanding.",
    source: "Quran 20:114",
  },
  {
    reference: "21:87",
    reflection: "This is a dua for moments of regret and pressure. Turning back to Allah is itself a mercy.",
    source: "Quran 21:87",
  },
  {
    reference: "25:74",
    reflection: "Islam teaches us to ask Allah for homes and families that help us reach Him, not distract us from Him.",
    source: "Quran 25:74",
  },
  {
    reference: "29:69",
    reflection: "Guidance deepens through sincere striving. Nooriva should help that striving feel possible every day.",
    source: "Quran 29:69",
  },
  {
    reference: "39:53",
    reflection: "No matter how distant a person feels, this verse keeps the door of return open.",
    source: "Quran 39:53",
  },
  {
    reference: "65:3",
    reflection: "Tawakkul is not vague optimism. It is anchoring the heart in Allah while taking the next right step.",
    source: "Quran 65:3",
  },
  {
    reference: "93:3",
    reflection: "In moments of emptiness, this ayah reminds the believer that Allah has not abandoned them.",
    source: "Quran 93:3",
  },
];

export function getAyahEntryForDate(date = new Date()) {
  const { dateKey } = getMalawiTimeParts(date);
  let seed = 0;

  for (const character of dateKey) {
    seed = (seed * 31 + character.charCodeAt(0)) % AYAH_COLLECTION.length;
  }

  return AYAH_COLLECTION[seed % AYAH_COLLECTION.length];
}

export async function fetchAyahOfTheDay(date = new Date()) {
  const selectedAyah = getAyahEntryForDate(date);
  const response = await fetch(
    `https://api.alquran.cloud/v1/ayah/${selectedAyah.reference}/editions/quran-uthmani,en.sahih`,
    {
      headers: {
        accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Ayah API returned ${response.status}`);
  }

  const payload = await response.json();
  const [arabic, english] = payload?.data ?? [];

  return {
    reference: selectedAyah.reference,
    arabic: arabic?.text ?? "",
    english: english?.text ?? "",
    surahName: english?.surah?.englishName ?? arabic?.surah?.englishName ?? "Quran",
    ayahInSurah: english?.numberInSurah ?? arabic?.numberInSurah ?? "",
    reflection: selectedAyah.reflection,
    source: selectedAyah.source,
  };
}
