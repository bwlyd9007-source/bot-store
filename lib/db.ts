import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Customer, Db, OrderEvent, StoreOrder } from "@/lib/types";
import { normalizeSaudiPhone } from "@/lib/customer";
import { legacyOrderNumber, normalizeOrderNumber } from "@/lib/orders";
import { sanitizeImage } from "@/lib/products";
import { site } from "@/lib/site";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const;

export type { Db } from "@/lib/types";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, SCRYPT_OPTIONS).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const candidate = scryptSync(password, salt, 64, SCRYPT_OPTIONS);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function newId() {
  return randomUUID();
}

function defaultDb(): Db {
  return {
    products: [],
    orders: [],
    settings: {
      whatsappUrl: site.whatsappUrl,
      discordUrl: site.discordUrl,
    },
    auth: {
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD ?? "BotStore@2026"),
    },
    customers: [],
    otps: [],
  };
}

const EVENT_TYPES = new Set(["created", "status", "note", "phone"]);

function normalizeEvents(events: OrderEvent[] | undefined, createdAt: string) {
  const valid = (Array.isArray(events) ? events : [])
    .filter(
      (event) =>
        event &&
        typeof event.at === "string" &&
        EVENT_TYPES.has(event.type) &&
        typeof event.text === "string",
    )
    .map((event) => ({
      at: event.at,
      type: event.type,
      text: event.text.slice(0, 300),
    }))
    .slice(-100);

  if (valid.length > 0) return valid;

  return [
    {
      at: createdAt || new Date().toISOString(),
      type: "created" as const,
      text: "تم إنشاء الطلب",
    },
  ];
}

function normalizeOrder(order: StoreOrder, taken: Set<string>, index: number): StoreOrder {
  const preferred = normalizeOrderNumber(order.number);
  const number =
    preferred && !taken.has(preferred)
      ? preferred
      : legacyOrderNumber(order.number || order.id || `legacy-${index}`, taken);
  taken.add(number);

  const note =
    typeof order.note === "string" && order.note.trim()
      ? order.note.trim().slice(0, 500)
      : undefined;

  const message =
    typeof order.message === "string" && order.message.trim()
      ? order.message.trim().slice(0, 1000)
      : undefined;

  return {
    ...order,
    number,
    note,
    message,
    customerPhone: normalizeSaudiPhone(order.customerPhone) ?? undefined,
    productImage: sanitizeImage(order.productImage),
    events: normalizeEvents(order.events, order.createdAt),
  };
}

function normalizeCustomer(customer: Customer): Customer | null {
  const phone = normalizeSaudiPhone(customer?.phone);
  if (!phone) return null;

  return {
    id: customer.id || newId(),
    phone,
    name: customer.name?.trim().slice(0, 40) || undefined,
    passwordHash:
      typeof customer.passwordHash === "string" && customer.passwordHash.length > 10
        ? customer.passwordHash
        : undefined,
    createdAt: customer.createdAt || new Date().toISOString(),
    lastLoginAt: customer.lastLoginAt,
  };
}

function normalize(raw: Partial<Db>): Db {
  const fallback = defaultDb();
  const takenNumbers = new Set<string>();
  const now = Date.now();

  return {
    products: Array.isArray(raw.products)
      ? raw.products.map((product) => ({
          ...product,
          image: sanitizeImage(product.image),
          description:
            typeof product.description === "string" && product.description.trim()
              ? product.description.trim().slice(0, 2000)
              : undefined,
        }))
      : [],
    orders: Array.isArray(raw.orders)
      ? raw.orders.map((order, index) => normalizeOrder(order, takenNumbers, index))
      : [],
    settings: {
      whatsappUrl: raw.settings?.whatsappUrl || fallback.settings.whatsappUrl,
      discordUrl: raw.settings?.discordUrl || fallback.settings.discordUrl,
    },
    auth: {
      passwordHash: raw.auth?.passwordHash || fallback.auth.passwordHash,
    },
    customers: Array.isArray(raw.customers)
      ? raw.customers
          .map(normalizeCustomer)
          .filter((customer): customer is Customer => Boolean(customer))
      : [],
    otps: Array.isArray(raw.otps)
      ? raw.otps.filter(
          (entry) =>
            entry &&
            typeof entry.codeHash === "string" &&
            normalizeSaudiPhone(entry.phone) &&
            Date.parse(entry.expiresAt) > now,
        )
      : [],
  };
}

export async function readDb(): Promise<Db> {
  try {
    const raw = await readFile(DB_FILE, "utf8");
    return normalize(JSON.parse(raw) as Partial<Db>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

    const db = defaultDb();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db: Db) {
  await mkdir(DATA_DIR, { recursive: true });

  const tempFile = `${DB_FILE}.${process.pid}.tmp`;
  await writeFile(tempFile, JSON.stringify(db, null, 2), "utf8");
  await rename(tempFile, DB_FILE);
}
