import { formatPhoneDisplay } from "@/lib/customer";
import { formatPrice } from "@/lib/products";
import type { OrderChannel, StoreOrder } from "@/lib/types";

const EMBED_COLOR = 0x38bdf8;
const WEBHOOK_PATTERN =
  /^https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api\/webhooks\/\d{5,}\/[A-Za-z0-9_-]+$/i;
const DATA_IMAGE_PATTERN = /^data:image\/(png|jpeg|jpg|webp|gif);base64,([A-Za-z0-9+/=]+)$/i;

type DiscordCard = {
  number: string;
  productName: string;
  price?: number;
  customerPhone?: string;
  channel?: OrderChannel;
  message?: string;
  image?: string;
  createdAt?: string;
  test?: boolean;
};

type Attachment = { base64: string; mime: string; ext: string };

export type DiscordResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "rejected" | "unreachable"; status?: number };

function clean(text: string, max = 1024) {
  const value = text.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return value ? value.slice(0, max) : "—";
}

function webhookUrl() {
  const raw = (process.env.DISCORD_WEBHOOK_URL ?? "")
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();
  return WEBHOOK_PATTERN.test(raw) ? raw : null;
}

function splitImage(image?: string) {
  const value = image?.trim();
  if (!value) return { url: null, attachment: null as Attachment | null };

  if (/^https:\/\/\S+$/i.test(value)) {
    return { url: value, attachment: null as Attachment | null };
  }

  const match = DATA_IMAGE_PATTERN.exec(value);
  if (!match) return { url: null, attachment: null as Attachment | null };

  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const mime = match[1].toLowerCase() === "jpg" ? "image/jpeg" : `image/${match[1].toLowerCase()}`;
  return { url: null, attachment: { base64: match[2], mime, ext } };
}

function buildPayload(card: DiscordCard) {
  const { url, attachment } = splitImage(card.image);
  const imageUrl = attachment ? `attachment://order.${attachment.ext}` : url;

  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: "📦 المنتج", value: clean(card.productName, 256), inline: true },
    {
      name: "💰 السعر",
      value:
        typeof card.price === "number"
          ? `${formatPrice(card.price)} ر.س`
          : "غير محدد",
      inline: true,
    },
    {
      name: "📱 رقم العميل",
      value: card.customerPhone ? formatPhoneDisplay(card.customerPhone) : "غير متوفر",
      inline: false,
    },
  ];

  if (card.channel) {
    fields.push({
      name: "قناة الطلب",
      value: card.channel === "discord" ? "ديسكورد" : "واتساب",
      inline: true,
    });
  }

  if (card.message) {
    fields.push({ name: "رسالة العميل", value: clean(card.message, 500), inline: false });
  }

  const embed: Record<string, unknown> = {
    title: card.test
      ? `🧪 طلب تجريبي #${card.number}`
      : `🛒 طلب جديد #${card.number}`,
    color: EMBED_COLOR,
    description: card.test
      ? "بطاقة تجريبية من لوحة تحكم BOT STORE للتأكد من وصول إشعارات الطلبات."
      : "وصل طلب جديد إلى المتجر — تابع التفاصيل أدناه.",
    fields,
    footer: { text: "BOT STORE" },
  };

  if (card.createdAt && Number.isFinite(Date.parse(card.createdAt))) {
    embed.timestamp = card.createdAt;
  }
  if (imageUrl) {
    embed.image = { url: imageUrl };
  }

  return { payload: { username: "BOT STORE", embeds: [embed] }, attachment };
}

async function postToDiscord(card: DiscordCard): Promise<DiscordResult> {
  const url = webhookUrl();
  if (!url) return { ok: false, reason: "not-configured" };

  const { payload, attachment } = buildPayload(card);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    let response: Response;

    if (attachment) {
      const form = new FormData();
      form.append("payload_json", JSON.stringify(payload));
      form.append(
        "files[0]",
        new Blob([Buffer.from(attachment.base64, "base64")], { type: attachment.mime }),
        `order.${attachment.ext}`,
      );
      response = await fetch(url, {
        method: "POST",
        body: form,
        signal: controller.signal,
        cache: "no-store",
      });
    } else {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });
    }

    if (!response.ok) {
      return { ok: false, reason: "rejected", status: response.status };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}

export function discordResultMessage(result: DiscordResult) {
  if (result.ok) return null;
  if (result.reason === "not-configured") {
    return "لم يتم ضبط رابط DISCORD_WEBHOOK_URL في ملف .env.local.";
  }
  if (result.reason === "rejected") {
    return `رفض ديسكورد الرسالة (HTTP ${result.status ?? "?"}) — تحقق من صلاحية رابط الـ Webhook.`;
  }
  return "تعذّر الاتصال بديسكورد، تحقق من الشبكة وحاول مجدداً.";
}

export async function notifyNewOrder(order: StoreOrder) {
  return postToDiscord({
    number: order.number,
    productName: order.productName,
    price: order.price,
    customerPhone: order.customerPhone,
    channel: order.channel,
    message: order.message,
    image: order.productImage,
    createdAt: order.createdAt,
  });
}

export async function sendTestOrderCard(sample?: {
  productName?: string;
  price?: number;
  image?: string;
}) {
  return postToDiscord({
    number: "TEST-000001",
    productName: sample?.productName || "البطاقة التجريبية",
    price: sample?.price,
    channel: "whatsapp",
    image: sample?.image,
    createdAt: new Date().toISOString(),
    test: true,
  });
}
