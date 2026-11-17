"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestOtp, verifyOtp } from "@/app/actions/account";
import { formatPhoneDisplay, normalizeSaudiPhone } from "@/lib/customer";
import {
  AlertIcon,
  ArrowIcon,
  CheckIcon,
  LockIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/icons";

const COOLDOWN_SECONDS = 45;

export function CustomerLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(
      () => setCooldown((value) => (value <= 1 ? 0 : value - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, [cooldown]);

  function submitPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeSaudiPhone(phoneInput);
    if (!normalized) {
      setError("أدخل رقم جوال سعودي صحيح يبدأ بـ 05، مثال: 0512345678.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await requestOtp(normalized);
      if (!result.ok) {
        setError(result.error ?? "تعذر إرسال الرمز، حاول مرة أخرى.");
        return;
      }
      setPhone(result.phone ?? normalized);
      setStep("code");
      setInfo(result.info ?? null);
      setCode("");
      setCooldown(COOLDOWN_SECONDS);
    });
  }

  function submitCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone) return;
    if (code.replace(/\D/g, "").length !== 6) {
      setError("أدخل رمز التحقق المكوّن من 6 أرقام.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await verifyOtp(phone, code);
      if (!result.ok) {
        setError(result.error ?? "تعذر التحقق من الرمز، حاول مرة أخرى.");
        return;
      }
      router.replace("/account");
      router.refresh();
    });
  }

  function resend() {
    if (!phone || cooldown > 0) return;
    setError(null);
    startTransition(async () => {
      const result = await requestOtp(phone);
      if (!result.ok) {
        setError(result.error ?? "تعذر إعادة إرسال الرمز.");
        return;
      }
      setInfo(result.info ?? null);
      setCode("");
      setCooldown(COOLDOWN_SECONDS);
    });
  }

  function changePhone() {
    setStep("phone");
    setPhone(null);
    setCode("");
    setInfo(null);
    setError(null);
    setCooldown(0);
  }

  if (step === "code" && phone) {
    return (
      <div className="mt-8">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3.5">
          <p className="text-[11px] font-bold text-white/40">أرسلنا الرمز إلى</p>
          <p
            dir="ltr"
            className="mt-1 font-mono text-base font-extrabold tracking-[0.06em] text-accent"
          >
            {formatPhoneDisplay(phone)}
          </p>
        </div>

        {info && (
          <p className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 py-2.5 text-[11px] font-semibold leading-6 text-emerald-200">
            <CheckIcon className="mt-1 size-3.5 shrink-0" />
            {info}
          </p>
        )}

        <form onSubmit={submitCode} className="mt-5">
          <label htmlFor="otp-code" className="text-sm font-bold text-white/70">
            رمز التحقق
          </label>
          <input
            id="otp-code"
            name="code"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              if (error) setError(null);
            }}
            placeholder="••••••"
            className="mt-2 h-14 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-center font-mono text-xl font-extrabold tracking-[0.5em] text-white outline-none transition placeholder:tracking-[0.3em] placeholder:text-white/20 focus:border-accent/60 focus:bg-white/[0.06]"
          />

          {error && (
            <p
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
            >
              <AlertIcon className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || code.length !== 6}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-[#04242a] shadow-[0_15px_40px_-15px_rgba(53,213,239,0.8)] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "جارٍ التحقق..." : "تأكيد الدخول"}
            {!pending && <ArrowIcon className="size-4 -scale-x-100" />}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={changePhone}
            className="font-bold text-white/45 transition hover:text-white"
          >
            تغيير الرقم
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={pending || cooldown > 0}
            className="font-bold text-accent transition hover:text-accent-soft disabled:text-white/30"
          >
            {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ث` : "إعادة إرسال الرمز"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submitPhone} className="mt-8">
      <label htmlFor="phone" className="text-sm font-bold text-white/70">
        رقم الجوال
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 start-4 grid place-items-center text-white/35">
          <PhoneIcon className="size-4.5" />
        </span>
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          required
          value={phoneInput}
          onChange={(event) => {
            setPhoneInput(event.target.value);
            if (error) setError(null);
          }}
          placeholder="05XXXXXXXX"
          className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] ps-11 pe-4 text-start font-mono text-sm tracking-[0.06em] text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
        />
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/35">
        <LockIcon className="size-3.5" />
        نرسل رمز التحقق عبر واتساب على هذا الرقم — أرقام سعودية فقط.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
        >
          <AlertIcon className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-[#04242a] shadow-[0_15px_40px_-15px_rgba(53,213,239,0.8)] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "جارٍ إرسال الرمز..." : "إرسال رمز التحقق"}
        {!pending && <ArrowIcon className="size-4 -scale-x-100" />}
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/30">
        <ShieldIcon className="size-3.5" />
        دخول آمن بدون كلمة مرور — رمز لمرة واحدة فقط.
      </p>
    </form>
  );
}
