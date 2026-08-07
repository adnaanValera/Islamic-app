import { findSession } from "./_lib/account-store.js";
import { getMalawiTimeParts } from "./_lib/prayer-data.js";
import { loadDailyNoorOverrideForDate, saveDailyNoorOverrideForDate } from "./_lib/daily-noor-store.js";

async function getSessionFromRequest(request) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!bearer) return null;
  return findSession(bearer);
}

function isAdminSession(session) {
  return Boolean(session && String(session.fullName).toLowerCase() === "adnaan valera");
}

export default async function handler(request, response) {
  const session = await getSessionFromRequest(request);

  if (!isAdminSession(session)) {
    response.status(403).json({ ok: false, error: "Forbidden." });
    return;
  }

  const dateKey = String(request.query?.dateKey || getMalawiTimeParts().dateKey);

  if (request.method === "GET") {
    const override = await loadDailyNoorOverrideForDate(dateKey);
    response.status(200).json({ ok: true, dateKey, override: override ?? {} });
    return;
  }

  if (request.method === "POST") {
    const payload = request.body ?? {};
    const saved = await saveDailyNoorOverrideForDate(dateKey, {
      ayah: payload.ayah ?? {},
      dua: payload.dua ?? {},
      reminder: payload.reminder ?? {},
      history: payload.history ?? {},
    });

    response.status(200).json({ ok: true, dateKey, override: saved });
    return;
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ ok: false, error: "Method not allowed." });
}
