import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash || "").split(":");

  if (!salt || !expected) {
    return false;
  }

  const actual = scryptSync(password, salt, 64).toString("hex");

  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export function createToken() {
  return randomBytes(24).toString("hex");
}
