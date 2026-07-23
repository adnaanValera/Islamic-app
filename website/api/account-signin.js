import { createSession, findUserByName, isAccountStorageConfigured } from "./_lib/account-store.js";
import { createToken, verifyPassword } from "./_lib/account-security.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  if (!isAccountStorageConfigured()) {
    response.status(503).json({ ok: false, error: "Account storage is not configured yet." });
    return;
  }

  const fullName = String(request.body?.fullName ?? "").trim();
  const password = String(request.body?.password ?? "");
  const user = await findUserByName(fullName);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    response.status(401).json({ ok: false, error: "Full name or password is incorrect." });
    return;
  }

  const token = createToken();
  await createSession({
    token,
    userId: user.id,
    fullName: user.fullName,
    createdAt: new Date().toISOString(),
  });

  response.status(200).json({
    ok: true,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
    },
  });
}
