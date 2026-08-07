import { findSession, loadUsers } from "./_lib/account-store.js";
import { loadMessages } from "./_lib/message-store.js";
import { getMalawiTimeParts } from "./_lib/prayer-data.js";
import { loadDailyNoorOverrideForDate } from "./_lib/daily-noor-store.js";

async function getSessionFromRequest(request) {
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!bearer) return null;
  return findSession(bearer);
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  const session = await getSessionFromRequest(request);
  if (!session || String(session.fullName).toLowerCase() !== "adnaan valera") {
    response.status(403).json({ ok: false, error: "Forbidden." });
    return;
  }

  const users = await loadUsers();
  const messages = await loadMessages();
  const dateKey = getMalawiTimeParts().dateKey;
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
