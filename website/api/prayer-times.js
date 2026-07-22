export default async function handler(request, response) {
  try {
    const upstream = await fetch(
      "https://masjidboardlive.com/boards/api/board.php?limbe-jaame",
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!upstream.ok) {
      response.status(upstream.status).json({
        ok: false,
        error: "Unable to load prayer times from the upstream source.",
      });
      return;
    }

    const payload = await upstream.json();

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    response.status(200).json(payload);
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: "Prayer times are temporarily unavailable.",
    });
  }
}
