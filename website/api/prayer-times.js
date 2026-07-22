import { fetchPrayerBoard } from "./_lib/prayer-data.js";

export default async function handler(request, response) {
  try {
    const payload = await fetchPrayerBoard();
    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "Prayer times are temporarily unavailable.",
    });
  }
}
