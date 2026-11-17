"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import {
  AlertIcon,
  ArrowIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "@/components/icons";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="mt-8">
      <label htmlFor="password" className="text-sm font-bold text-white/70">
        كلمة المرور
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 start-4 grid place-items-center text-white/35">
          <LockIcon className="size-4.5" />
        </span>
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoFocus
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] ps-11 pe-12 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
          className="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-lg text-white/35 transition hover:text-accent"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300"
        >
          <AlertIcon className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-[#04242a] shadow-[0_15px_40px_-15px_rgba(53,213,239,0.8)] transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "جارٍ الدخول..." : "دخول للوحة التحكم"}
        {!pending && <ArrowIcon className="size-4 -scale-x-100" />}
      </button>
    </form>
  );
}
