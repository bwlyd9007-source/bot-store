import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { ArrowIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "دخول لوحة التحكم | BOT STORE",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -top-32 start-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_85%_100%,rgba(53,213,239,0.06),transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-[#0d151b]/90 p-7 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
          <div className="flex items-center gap-3">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
              <Image src="/logo-icon.png" alt="" fill sizes="44px" className="object-cover" />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-wide">BOT STORE</p>
              <p className="text-xs font-semibold text-accent">لوحة التحكم</p>
            </div>
          </div>

          <h1 className="mt-7 text-2xl font-extrabold">أهلاً بعودتك</h1>
          <p className="mt-2 text-sm leading-7 text-white/45">
            أدخل كلمة المرور للوصول إلى إدارة المتجر والمنتجات والطلبات.
          </p>

          <LoginForm />
        </div>

        <div className="mt-5 flex items-center justify-between px-1 text-xs text-white/35">
          <span>الوصول مخصص لإدارة المتجر فقط.</span>
          <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-accent">
            العودة للمتجر
            <ArrowIcon className="size-3.5 -scale-x-100" />
          </Link>
        </div>
      </div>
    </main>
  );
}
