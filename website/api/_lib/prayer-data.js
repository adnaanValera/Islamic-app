const MALAWI_TIME_ZONE = "Africa/Blantyre";

export const PRAYER_DEFINITIONS = [
  { athanKey: "fajrAthan", salahKey: "fajrJamaah", endKey: "sunrise", label: "Fajr" },
  { athanKey: "dhuhrAthan", salahKey: "dhuhrJamaah", endKey: "asrShafi", label: "Zuhr" },
  { athanKey: "asrAthan", salahKey: "asrJamaah", endKey: "sunset", label: "Asr" },
  { athanKey: "maghribAthan", salahKey: "maghribJamaah", endKey: "eshaStarts", label: "Maghrib" },
  { athanKey: "eshaAthan", salahKey: "eshaJamaah", endKey: null, label: "Esha" },
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

  return PRAYER_DEFINITIONS.map((prayer, index) => ({
    label: prayer.label,
    athan: data?.[prayer.athanKey] ?? "--:--",
    salah: data?.[prayer.salahKey] ?? "--:--",
    endTime: prayer.endKey ? data?.[prayer.endKey] ?? "--:--" : "--:--",
    index,
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
