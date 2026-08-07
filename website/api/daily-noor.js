import { getDailyNoorPayload } from "./_lib/daily-noor.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  try {
    const payload = await getDailyNoorPayload();
    response.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    response.status(200).json({
      ok: true,
      ...payload,
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "Today's Noor is temporarily unavailable.",
    });
  }
}
