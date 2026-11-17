"use client";

import { useActionState, useState } from "react";
import {
  saveCustomerNameAction,
  type ProfileState,
} from "@/app/actions/account";
import { AlertIcon, CheckIcon, UserIcon } from "@/components/icons";
import { formatPhoneDisplay } from "@/lib/customer";

const initialState: ProfileState = { status: "idle" };

export function ProfileForm({
  phone,
  name,
}: {
  phone: string;
  name: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    saveCustomerNameAction,
    initialState,
  );
  const [value, setValue] = useState(name ?? "");

  return (
    <form action={formAction}>
      <label htmlFor="profile-name" className="text-xs font-bold text-white/60">
        الاسم
      </label>
      <input
        id="profile-name"
        name="name"
        type="text"
        autoComplete="name"
        value={value}
        maxLength={40}
        onChange={(event) => setValue(event.target.value)}
        placeholder="اكتب اسمك ليظهر في طلباتك"
        className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-white/30">{value.trim().length}/40</span>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-xs font-extrabold text-[#04242a] transition hover:bg-accent-soft disabled:opacity-60"
        >
          {pending ? "جارٍ الحفظ..." : "حفظ الاسم"}
        </button>
      </div>

      {state.status === "error" ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-red-300">
          <AlertIcon className="size-3.5" />
          {state.message}
        </p>
      ) : (
        state.status === "success" && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
            <CheckIcon className="size-3.5" />
            {state.message}
          </p>
        )
      )}

      <dl className="mt-5 grid gap-2 border-t border-white/[0.06] pt-4 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/40">رقم الجوال</dt>
          <dd className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white/70">
            <span dir="ltr">{formatPhoneDisplay(phone)}</span>
            <span className="grid size-4 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
              <CheckIcon className="size-2.5" />
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-white/40">طريقة الدخول</dt>
          <dd className="flex items-center gap-1.5 font-semibold text-white/55">
            <UserIcon className="size-3.5 text-accent" />
            رمز واتساب
          </dd>
        </div>
      </dl>
    </form>
  );
}
