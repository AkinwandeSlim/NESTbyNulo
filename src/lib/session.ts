import { createHmac, timingSafeEqual } from "crypto";

/**
 * Dev-fallback session tokens (only used when Clerk keys are absent).
 * Format: "<userId>.<expiryMs>.<hmac>" — HMAC-SHA256 signed, HttpOnly cookie.
 * When Clerk is enabled this module is unused; Clerk owns the session.
 */
export const SESSION_COOKIE = "nest_dev_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return process.env.AUTH_DEV_SECRET || "nest-dev-gstack-insecure-session-secret-change-me";
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createSessionValue(userId: string): string {
  const exp = String(Date.now() + SESSION_TTL_MS);
  const body = `${userId}.${exp}`;
  return `${body}.${sign(body)}`;
}

export function parseSessionValue(value: string | undefined | null): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, mac] = parts;
  const expected = sign(`${userId}.${exp}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(exp) < Date.now()) return null;
  return userId;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
