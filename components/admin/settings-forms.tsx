"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  changePasswordAction,
  saveSettingsAction,
  sendDiscordTestAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  AlertIcon,
  ChatIcon,
  CheckIcon,
  DiscordIcon,
  LockIcon,
} from "@/components/icons";
import type { StoreSettings } from "@/lib/types";

const initialState: ActionState = { status: "idle" };

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]";

const labelClass = "flex items-center gap-2 text-xs font-bold text-white/60";

function Notice({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const success = state.status === "success";
  return (
    <p
      role="status"
      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
        success
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
          : "border-red-400/20 bg-red-500/10 text-red-300"
      }`}
    >
      {success ? <CheckIcon className="size-4 shrink-0" /> : <AlertIcon className="size-4 shrink-0" />}
      {state.message}
    </p>
  );
}

export function SettingsForms({ settings }: { settings: StoreSettings }) {
  const [contactState, contactAction, contactPending] = useActionState(
    saveSettingsAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [discordState, discordAction, discordPending] = useActionState(
    sendDiscordTestAction,
    initialState,
  );
  const passwordForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (passwordState.status === "success") passwordForm.current?.reset();
  }, [passwordState]);

  return (
    <div className="mt-7 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <ChatIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold">بيانات التواصل</h2>
            <p className="mt-0.5 text-[11px] text-white/35">
              تُستخدم في الهيدر والفوتر ونافذة الطلب.
            </p>
          </div>
        </div>

        <form action={contactAction} className="mt-6 grid gap-4">
          <div>
            <label htmlFor="whatsappUrl" className={labelClass}>
              <ChatIcon className="size-3.5 text-accent" />
              رابط واتساب
            </label>
            <input
              id="whatsappUrl"
              name="whatsappUrl"
              dir="ltr"
              required
              defaultValue={settings.whatsappUrl}
              placeholder="https://wa.me/9665xxxxxxxx"
              className={`${inputClass} text-start`}
            />
          </div>

          <div>
            <label htmlFor="discordUrl" className={labelClass}>
              <DiscordIcon className="size-3.5 text-accent" />
              رابط سيرفر ديسكورد
            </label>
            <input
              id="discordUrl"
              name="discordUrl"
              dir="ltr"
              required
              defaultValue={settings.discordUrl}
              placeholder="https://discord.gg/xxxxxx"
              className={`${inputClass} text-start`}
            />
          </div>

          <Notice state={contactState} />

          <button
            type="submit"
            disabled={contactPending}
            className="h-11 rounded-xl bg-accent text-sm font-extrabold text-[#04242a] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
          >
            {contactPending ? "جارٍ الحفظ..." : "حفظ بيانات التواصل"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <LockIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold">كلمة مرور اللوحة</h2>
            <p className="mt-0.5 text-[11px] text-white/35">
              غيّر كلمة المرور بشكل دوري لحماية متجرك.
            </p>
          </div>
        </div>

        <form ref={passwordForm} action={passwordAction} className="mt-6 grid gap-4">
          <div>
            <label htmlFor="current" className={labelClass}>
              كلمة المرور الحالية
            </label>
            <input
              id="current"
              name="current"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="next" className={labelClass}>
              كلمة المرور الجديدة
            </label>
            <input
              id="next"
              name="next"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="confirm" className={labelClass}>
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <Notice state={passwordState} />

          <button
            type="submit"
            disabled={passwordPending}
            className="h-11 rounded-xl border border-accent/40 bg-accent/10 text-sm font-extrabold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordPending ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
          </button>
        </form>

        <p className="mt-4 text-[11px] leading-6 text-white/30">
          تُحفظ كلمة المرور مشفّرة (scrypt) داخل ملف بيانات المتجر.
        </p>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 lg:col-span-2">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
            <DiscordIcon className="size-5" />
          </span>
          <div>
            <h2 className="text-sm font-extrabold">إشعارات ديسكورد</h2>
            <p className="mt-0.5 text-[11px] text-white/35">
              تصل بطاقة بكل طلب جديد تلقائياً إلى روم ديسكورد، وتشمل رقم الطلب
              والمنتج والسعر ورقم العميل وصورة المنتج.
            </p>
          </div>
        </div>

        <form action={discordAction} className="mt-6 grid gap-4">
          <Notice state={discordState} />

          <button
            type="submit"
            disabled={discordPending}
            className="h-11 rounded-xl border border-accent/40 bg-accent/10 text-sm font-extrabold text-accent transition hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {discordPending ? "جارٍ الإرسال..." : "إرسال طلب تجريبي للديسكورد"}
          </button>
        </form>

        <p className="mt-4 text-[11px] leading-6 text-white/30">
          يُقرأ رابط الـ Webhook من المتغير DISCORD_WEBHOOK_URL في الخادم، ولا
          يظهر أبداً في المتصفح.
        </p>
      </section>
    </div>
  );
}
