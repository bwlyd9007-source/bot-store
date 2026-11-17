const ORDER_MIN = 100000;
const ORDER_SPAN = 900000;

export function generateOrderNumber() {
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  return String(ORDER_MIN + (value[0] % ORDER_SPAN));
}

export function normalizeOrderNumber(value?: string | null) {
  const candidate = (value ?? "").trim();
  return /^\d{6}$/.test(candidate) ? candidate : null;
}

export function uniqueOrderNumber(
  taken: Set<string>,
  preferred?: string | null,
) {
  const normalized = normalizeOrderNumber(preferred);
  if (normalized && !taken.has(normalized)) return normalized;

  let candidate = generateOrderNumber();
  while (taken.has(candidate)) candidate = generateOrderNumber();
  return candidate;
}

export function legacyOrderNumber(seed: string, taken: Set<string>) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  for (let attempt = 0; attempt < 200; attempt += 1) {
    const candidate = String(ORDER_MIN + (((hash >>> 0) + attempt * 7919) % ORDER_SPAN));
    if (!taken.has(candidate)) return candidate;
  }

  return uniqueOrderNumber(taken);
}
