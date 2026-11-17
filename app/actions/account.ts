"use server";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerPhone, endCustomerSession, startCustomerSession } from "@/lib/customer-auth";
import { formatPhoneDisplay, normalizeSaudiPhone } from "@/lib/customer";
import { newId, readDb, updateDb } from "@/lib/db";
import {
  getWhatsAppStatus,
  isWhatsAppApiConfigured,
  sendWhatsAppOtp,
} from "@/lib/whatsapp";

export type RequestOtpResult = {
  ok: boolean;
  phone?: string;
  error?: string;
  info?: string;
};

export type VerifyOtpResult = {
  ok: boolean;
  error?: string;
};

export type ProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const OTP_MAX_AGE = 5 * 60 * 1000;
const OTP_COOLDOWN = 45 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function hashOtp(phone: string, code: string) {
  return createHmac("sha256", process.env.ADMIN_SECRET || "botstore-dev-secret")
    .update(`${phone}:${code}`)
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export async function requestOtp(phoneInput: string): Promise<RequestOtpResult> {
  const phone = normalizeSaudiPhone(phoneInput);
  if (!phone) {
    return {
      ok: false,
      error: "أدخل رقم جوال سعودي صحيح يبدأ بـ 05، مثال: 0512345678.",
    };
  }

  if (!isWhatsAppApiConfigured()) {
    return {
      ok: false,
      error:
        "خدمة التحقق عبر واتساب غير مفعّلة حالياً، تواصل مع إدارة المتجر لإتمام طلبك.",
    };
  }

  const whatsapp = await getWhatsAppStatus();
  if (whatsapp.state === "unreachable") {
    return {
      ok: false,
      error: "تعذّر الاتصال بخدمة واتساب حالياً، حاول مرة أخرى بعد قليل.",
    };
  }
  if (whatsapp.provider === "green" && whatsapp.state !== "authorized") {
    return {
      ok: false,
      error: "خدمة التحقق عبر واتساب قيد التفعيل حالياً، تواصل مع إدارة المتجر لإتمام طلبك.",
    };
  }

  const db = await readDb();
  const now = Date.now();
  const existing = db.otps.find((entry) => entry.phone === phone);

  if (existing) {
    const elapsed = now - Date.parse(existing.sentAt);
    const wait = Math.ceil((OTP_COOLDOWN - elapsed) / 1000);
    if (wait > 0) {
      return {
        ok: false,
        error: `تم إرسال رمز قبل قليل، انتظر ${wait} ثانية ثم أعد المحاولة.`,
      };
    }
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const text = `رمز التحقق الخاص بك في BOT STORE هو: ${code}\nصالح لمدة 5 دقائق. لا تشاركه مع أحد.`;
  const result = await sendWhatsAppOtp(phone, code, text);

  if (!result.sent) {
    return {
      ok: false,
      error:
        "تعذّر إرسال رمز التحقق عبر واتساب، تحقق من الرقم وحاول مرة أخرى بعد قليل.",
    };
  }

  const sentAt = new Date(now).toISOString();
  const codeHash = hashOtp(phone, code);
  await updateDb((db) => {
    db.otps = [
      {
        phone,
        codeHash,
        sentAt,
        expiresAt: new Date(now + OTP_MAX_AGE).toISOString(),
        attempts: 0,
      },
      ...db.otps.filter((entry) => entry.phone !== phone),
    ];
  });

  return {
    ok: true,
    phone,
    info: `أرسلنا رمز التحقق إلى واتساب ${formatPhoneDisplay(phone)}.`,
  };
}

export async function verifyOtp(
  phoneInput: string,
  codeInput: string,
): Promise<VerifyOtpResult> {
  const phone = normalizeSaudiPhone(phoneInput);
  if (!phone) return { ok: false, error: "رقم الجوال غير صالح." };

  const code = codeInput.replace(/\D/g, "").slice(0, 6);
  if (code.length !== 6) {
    return { ok: false, error: "أدخل رمز التحقق المكوّن من 6 أرقام." };
  }

  const outcome = await updateDb<VerifyOtpResult>((db) => {
    const entry = db.otps.find((item) => item.phone === phone);
    if (!entry) {
      return {
        ok: false,
        error: "انتهت صلاحية الرمز أو لم يُطلب بعد. اطلب رمزاً جديداً.",
      };
    }
    if (Date.parse(entry.expiresAt) <= Date.now()) {
      db.otps = db.otps.filter((item) => item.phone !== phone);
      return { ok: false, error: "انتهت صلاحية الرمز، اطلب رمزاً جديداً." };
    }
    if (entry.attempts >= OTP_MAX_ATTEMPTS) {
      return { ok: false, error: "تجاوزت عدد المحاولات، اطلب رمزاً جديداً." };
    }

    if (!safeEqual(entry.codeHash, hashOtp(phone, code))) {
      entry.attempts += 1;
      const left = OTP_MAX_ATTEMPTS - entry.attempts;
      return {
        ok: false,
        error:
          left > 0
            ? `الرمز غير صحيح. متبقي ${left} محاولات.`
            : "تجاوزت عدد المحاولات، اطلب رمزاً جديداً.",
      };
    }

    db.otps = db.otps.filter((item) => item.phone !== phone);

    const now = new Date().toISOString();
    let customer = db.customers.find((item) => item.phone === phone);
    if (!customer) {
      customer = { id: newId(), phone, createdAt: now };
      db.customers.unshift(customer);
    }
    customer.lastLoginAt = now;

    return { ok: true };
  });

  if (!outcome.ok) return outcome;

  await startCustomerSession(phone);
  revalidatePath("/account");

  return { ok: true };
}

export async function getSessionCustomer() {
  const phone = await getCustomerPhone();
  if (!phone) return null;

  const db = await readDb();
  const customer = db.customers.find((item) => item.phone === phone);
  return { phone, name: customer?.name ?? null };
}

export async function logoutCustomer() {
  await endCustomerSession();
  redirect("/");
}

export async function saveCustomerNameAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const phone = await getCustomerPhone();
  if (!phone) {
    return { status: "error", message: "انتهت الجلسة، سجّل الدخول من جديد." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) {
    return { status: "error", message: "أدخل اسماً من حرفين على الأقل." };
  }
  if (name.length > 40) {
    return { status: "error", message: "الاسم طويل جداً، الحد 40 حرفاً." };
  }

  const saved = await updateDb((db) => {
    const customer = db.customers.find((item) => item.phone === phone);
    if (!customer) return false;

    customer.name = name;
    return true;
  });

  if (!saved) {
    return { status: "error", message: "تعذّر العثور على بياناتك، سجّل الدخول من جديد." };
  }

  revalidatePath("/account");

  return { status: "success", message: "تم حفظ اسمك بنجاح." };
}
