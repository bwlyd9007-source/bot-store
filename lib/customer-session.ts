import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeSaudiPhone } from "@/lib/customer";

export const CUSTOMER_COOKIE = "bs_customer_session";
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30;

const SECRET = process.env.ADMIN_SECRET || "botstore-dev-secret";

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createCustomerToken(phone: string, now = Date.now()) {
  const encoded = Buffer.from(phone, "utf8").toString("base64url");
  const payload = `v1.${encoded}.${now}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyCustomerToken(token: string | null | undefined) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 4) return null;

  const [version, encoded, issuedAt, signature] = parts;
  if (version !== "v1") return null;

  const expected = sign(`${version}.${encoded}.${issuedAt}`);
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    provided.length !== expectedBuffer.length ||
    !timingSafeEqual(provided, expectedBuffer)
  ) {
    return null;
  }

  const issuedTime = Number(issuedAt);
  if (!Number.isFinite(issuedTime)) return null;

  const age = Date.now() - issuedTime;
  if (age < -60_000 || age >= CUSTOMER_MAX_AGE * 1000) return null;

  return normalizeSaudiPhone(Buffer.from(encoded, "base64url").toString("utf8"));
}
