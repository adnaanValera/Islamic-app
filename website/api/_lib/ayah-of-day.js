import { getMalawiTimeParts } from "./prayer-data.js";

const QURAN_TOTAL_AYAHS = 6236;

export function getAyahNumberForDate(date = new Date()) {
  const { dateKey } = getMalawiTimeParts(date);
  let seed = 0;

  for (const character of dateKey) {
    seed = (seed * 31 + character.charCodeAt(0)) % QURAN_TOTAL_AYAHS;
  }

  return (seed % QURAN_TOTAL_AYAHS) + 1;
}

export async function fetchAyahOfTheDay(date = new Date()) {
  const ayahNumber = getAyahNumberForDate(date);
  const response = await fetch(
    `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,en.sahih`,
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
    ayahNumber,
    arabic: arabic?.text ?? "",
    english: english?.text ?? "",
    surahName: english?.surah?.englishName ?? arabic?.surah?.englishName ?? "Quran",
    ayahInSurah: english?.numberInSurah ?? arabic?.numberInSurah ?? "",
  };
}
