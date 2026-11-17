export const categorySuggestions = [
  "حماية",
  "إدارة",
  "ترفيه",
  "ذكاء اصطناعي",
  "برمجة",
  "تصميم",
];

const IMAGE_DATA_PATTERN = /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+$/i;

export function sanitizeImage(value?: string | null) {
  const candidate = (value ?? "").trim();
  if (!candidate || candidate.length > 3_000_000) return undefined;
  if (IMAGE_DATA_PATTERN.test(candidate)) return candidate;
  if (candidate.length <= 1000 && /^https?:\/\/\S+$/i.test(candidate)) return candidate;
  if (candidate.length <= 1000 && /^\/\S*$/.test(candidate)) return candidate;
  return undefined;
}

export function formatPrice(price: number) {
  return price.toLocaleString("en-US");
}

export function formatDateTime(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-nu-latn", {
      dateStyle: "long",
      timeZone: "Asia/Riyadh",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
