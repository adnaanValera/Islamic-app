import { findSession, loadUsers } from "./_lib/account-store.js";
import { loadMessages } from "./_lib/message-store.js";
import { getMalawiTimeParts } from "./_lib/prayer-data.js";
import { loadDailyNoorOverrideForDate, saveDailyNoorOverrideForDate } from "./_lib/daily-noor-store.js";

async function getSessionFromRequest(request) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!bearer) return null;
  return findSession(bearer);
}

function isAdminName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase() === "adnaan valera";
}

export default async function handler(request, response) {
  const session = await getSessionFromRequest(request);

  if (!session || !isAdminName(session.fullName)) {
    response.status(403).json({ ok: false, error: "Forbidden." });
    return;
  }

  const mode = String(request.query?.mode || "overview").toLowerCase();
  const dateKey = String(request.query?.dateKey || getMalawiTimeParts().dateKey);

  if (mode === "daily-noor") {
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
    return;
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const users = await loadUsers();
  const messages = await loadMessages();
  const dailyNoorOverride = await loadDailyNoorOverrideForDate(dateKey);

  response.status(200).json({
    ok: true,
    dateKey,
    users: users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      createdAt: user.createdAt,
    })),
    messages,
    dailyNoorOverride: dailyNoorOverride ?? {},
  });
}
