"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AlertIcon, CheckIcon, WhatsAppIcon } from "@/components/icons";
import type { WhatsAppStatus } from "@/lib/whatsapp";

type Tone = "ok" | "warn" | "bad" | "idle";

const STATE_INFO: Record<string, { label: string; description: string; tone: Tone }> = {
  authorized: {
    label: "متصل وجاهز",
    description: "يمكن إرسال رموز التحقق للعملاء عبر واتساب الآن.",
    tone: "ok",
  },
  notAuthorized: {
    label: "بانتظار ربط الجهاز",
    description: "امسح رمز QR من تطبيق واتساب في جوال المتجر لتفعيل الإرسال.",
    tone: "warn",
  },
  starting: {
    label: "جارٍ التشغيل",
    description: "الخدمة تستعد للاتصال، انتظر قليلاً وسيظهر رمز QR.",
    tone: "warn",
  },
  sleepMode: {
    label: "وضع النوم",
    description: "الحساب في وضع النوم، افتح تطبيق واتساب على الجوال لإيقاظه.",
    tone: "warn",
  },
  blocked: {
    label: "الحساب محظور",
    description: "أوقف واتساب هذا الحساب، راجع لوحة GREEN-API لمعرفة السبب.",
    tone: "bad",
  },
  unreachable: {
    label: "تعذّر الوصول إلى الخدمة",
    description: "لم نتمكن من الاتصال بخدمة واتساب، تحقق من الإنترنت ثم أعد المحاولة.",
    tone: "bad",
  },
  unknown: {
    label: "جارٍ التحقق من الحالة",
    description: "الخدمة تعيد حالة غير معروفة، انتظر قليلاً أو اضغط «فحص الحالة الآن».",
    tone: "warn",
  },
};

const TONE_CLASSES: Record<Tone, string> = {
  ok: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  bad: "border-red-400/20 bg-red-500/10 text-red-300",
  idle: "border-white/10 bg-white/[0.04] text-white/50",
};

function formatPhone(phone: string) {
  const match = /^966(5\d{8})$/.exec(phone);
  if (!match) return `+${phone}`;
  const digits = match[1];
  return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

export function WhatsAppPanel({
  initialStatus,
}: {
  initialStatus: WhatsAppStatus;
}) {
  const [status, setStatus] = useState<WhatsAppStatus>(initialStatus);
  const [qrNonce, setQrNonce] = useState(0);
  const [qrFailed, setQrFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/whatsapp", { cache: "no-store" });
      if (response.ok) setStatus((await response.json()) as WhatsAppStatus);
    } catch {
      setStatus({ provider: "green", state: "unreachable", phone: null });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(load, 20000);
    return () => clearInterval(timer);
  }, [load]);

  const waitingForQr =
    status?.provider === "green" && status.state === "notAuthorized";

  useEffect(() => {
    if (!waitingForQr) return;
    const timer = setInterval(() => {
      setQrFailed(false);
      setQrNonce((value) => value + 1);
    }, 20000);
    return () => clearInterval(timer);
  }, [waitingForQr]);

  if (status.provider === "none") {
    return (
      <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
        <div className="flex items-center gap-3 text-red-300">
          <AlertIcon className="size-5 shrink-0" />
          <h2 className="text-sm font-extrabold">خدمة واتساب غير مضبوطة</h2>
        </div>
        <p className="mt-3 text-xs leading-6 text-white/50">
          أضف بيانات GREEN-API في ملف <code dir="ltr">.env.local</code>:
          <span dir="ltr" className="mt-2 block font-mono text-[11px] text-white/70">
            GREENAPI_ID_INSTANCE
            <br />
            GREENAPI_API_TOKEN
            <br />
            GREENAPI_API_URL
          </span>
          ثم أعد تشغيل الخادم.
        </p>
      </div>
    );
  }

  if (status.provider === "meta") {
    return (
      <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
        <div className="flex items-center gap-3 text-emerald-300">
          <CheckIcon className="size-5 shrink-0" />
          <h2 className="text-sm font-extrabold">مفعّل عبر WhatsApp Cloud API</h2>
        </div>
        <p className="mt-3 text-xs leading-6 text-white/50">
          الإرسال يتم عبر Meta، وتُستخدم قالب OTP المعتمد في إعدادات الحساب.
        </p>
      </div>
    );
  }

  const info = STATE_INFO[status.state ?? "unknown"] ?? STATE_INFO.unknown;

  return (
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-5 content-start">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
              <WhatsAppIcon className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold">حالة الاتصال</h2>
              <p className="mt-0.5 text-[11px] text-white/35">
                رقم واتساب المتجر الذي يُرسل منه رمز الدخول.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${TONE_CLASSES[info.tone]}`}>
              {info.tone === "ok" ? (
                <CheckIcon className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertIcon className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="text-xs font-extrabold">{info.label}</p>
                <p className="mt-1 text-[11px] leading-5 text-white/45">
                  {info.description}
                </p>
              </div>
            </div>

            {status.phone ? (
              <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
                <span className="text-xs font-semibold text-white/45">
                  الرقم المرتبط
                </span>
                <span dir="ltr" className="font-mono text-xs font-bold text-white/80">
                  {formatPhone(status.phone)}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                setQrFailed(false);
                setQrNonce((value) => value + 1);
                load();
              }}
              className="justify-self-start rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/60 transition hover:border-accent/40 hover:text-accent"
            >
              فحص الحالة الآن
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <h2 className="text-sm font-extrabold">كيف يعمل الدخول بواتساب؟</h2>
          <ol className="mt-4 grid gap-2.5 text-xs leading-6 text-white/45">
            <li>1. العميل يكتب رقم جواله في صفحة الدخول ويطلب رمزاً.</li>
            <li>2. يصل الرمز من رقم المتجر على واتساب خلال لحظات.</li>
            <li>3. يُدخل العميل الرمز فيُفتح ملفه وطلباته مباشرة.</li>
          </ol>
        </section>
      </div>

      {waitingForQr ? (
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
          <h2 className="text-sm font-extrabold">ربط رقم المتجر</h2>
          <p className="mt-1.5 text-[11px] leading-5 text-white/35">
            افتح واتساب ← الأجهزة المرتبطة ← ربط جهاز، ثم امسح الرمز:
          </p>

          <div className="mx-auto mt-5 grid size-60 place-items-center rounded-2xl bg-white p-3">
            {qrFailed ? (
              <button
                type="button"
                onClick={() => {
                  setQrFailed(false);
                  setQrNonce((value) => value + 1);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
              >
                أعد تحميل الرمز
              </button>
            ) : (
              <Image
                key={qrNonce}
                src={`/api/admin/whatsapp?format=qr&t=${qrNonce}`}
                alt="رمز ربط واتساب"
                width={216}
                height={216}
                unoptimized
                onError={() => setQrFailed(true)}
              />
            )}
          </div>

          <p className="mt-4 text-[11px] leading-5 text-white/30">
            يتجدد الرمز تلقائياً كل 20 ثانية، وإن انتهت صلاحيته أعد فتح الصفحة.
          </p>
        </section>
      ) : null}
    </div>
  );
}
