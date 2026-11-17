import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "bs_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const SECRET = process.env.ADMIN_SECRET || "botstore-dev-secret";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(now = Date.now()) {
  const payload = `v1.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | null | undefined) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [version, issuedAt, signature] = parts;
  if (version !== "v1") return false;

  const expected = sign(`${version}.${issuedAt}`);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return false;
  }

  const issuedTime = Number(issuedAt);
  if (!Number.isFinite(issuedTime)) return false;

  const age = Date.now() - issuedTime;
  return age >= -60_000 && age < SESSION_MAX_AGE * 1000;
}
