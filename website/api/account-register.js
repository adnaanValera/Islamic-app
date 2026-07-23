import { createToken, hashPassword } from "./_lib/account-security.js";
import {
  createSession,
  findUserByName,
  isAccountStorageConfigured,
  upsertUser,
} from "./_lib/account-store.js";

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

  if (fullName.length < 2 || password.length < 4) {
    response.status(400).json({ ok: false, error: "Full name and password are required." });
    return;
  }

  const existingUser = await findUserByName(fullName);

  if (existingUser) {
    response.status(409).json({ ok: false, error: "An account with that full name already exists." });
    return;
  }

  const user = {
    id: createToken(),
    fullName,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await upsertUser(user);
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
