const MALAWI_TIME_ZONE = "Africa/Blantyre";

export const PRAYER_DEFINITIONS = [
  { key: "fajrAthan", label: "Fajr" },
  { key: "dhuhrAthan", label: "Zuhr" },
  { key: "asrAthan", label: "Asr" },
  { key: "maghribAthan", label: "Maghrib" },
  { key: "eshaAthan", label: "Esha" },
];

export async function fetchPrayerBoard() {
  const upstream = await fetch("https://masjidboardlive.com/boards/api/board.php?limbe-jaame", {
    headers: {
      accept: "application/json",
    },
  });

  if (!upstream.ok) {
    throw new Error(`Upstream prayer board returned ${upstream.status}`);
  }

  return upstream.json();
}

export function getPrayerTimesFromPayload(payload) {
  const data = payload?.data ?? {};

  return PRAYER_DEFINITIONS.map((prayer) => ({
    label: prayer.label,
    athan: data?.[prayer.key] ?? "--:--",
  }));
}

export function getMalawiTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: MALAWI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    timeKey: `${values.hour}:${values.minute}`,
  };
}
