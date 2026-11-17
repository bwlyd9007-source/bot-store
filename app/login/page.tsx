import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CustomerLoginForm } from "@/components/customer/login-form";
import {
  ArrowIcon,
  CheckIcon,
  ChatIcon,
  LockIcon,
  ReceiptIcon,
  UserIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "تسجيل الدخول | BOT STORE",
  description:
    "سجّل دخولك برقم جوالك ورمز واتساب لمتابعة طلباتك وملفك التعريفي في BOT STORE.",
};

const perks = [
  {
    icon: ReceiptIcon,
    title: "طلباتك في مكان واحد",
    text: "رقم الطلب، اسم المنتج، السعر، وحالة الطلب — كلها في صفحة طلباتك.",
  },
  {
    icon: UserIcon,
    title: "ملف تعريفي خاص",
    text: "أضف اسمك ليظهر في طلباتك، وعدّله في أي وقت.",
  },
  {
    icon: ChatIcon,
    title: "دخول آمن",
    text: "رقم جوالك فقط، ويصلك رمز تحقق على واتساب — بدون كلمة مرور.",
  },
];

export default function CustomerLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      <div className="pointer-events-none absolute -top-40 start-1/2 size-[34rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_85%_100%,rgba(53,213,239,0.06),transparent_60%)]" />

      <div className="relative grid w-full max-w-4xl gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
        <section className="hidden flex-col justify-between rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 lg:flex">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image src="/logo-icon.png" alt="" fill sizes="44px" className="object-cover" />
              </span>
              <div>
                <p className="text-lg font-extrabold tracking-wide">BOT STORE</p>
                <p className="text-xs font-semibold text-accent">تسجيل الدخول</p>
              </div>
            </Link>

            <h1 className="mt-10 text-3xl font-extrabold leading-[1.35]">
              طلباتك
              <span className="text-gradient"> في مكان واحد</span>
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/45">
              أدخل رقم جوالك ويصلك رمز التحقق على واتساب — بدون كلمة مرور.
            </p>

            <ul className="mt-8 grid gap-4">
              {perks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <li key={perk.title} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                      <Icon className="size-4.5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white/85">{perk.title}</p>
                      <p className="mt-0.5 text-xs leading-6 text-white/40">
                        {perk.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="mt-10 flex items-center gap-2 border-t border-white/[0.06] pt-5 text-[11px] text-white/30">
            <LockIcon className="size-3.5" />
            رقمك محمي ولا يظهر إلا لك ولإدارة المتجر عند الحاجة.
          </p>
        </section>

        <div className="rounded-3xl border border-white/10 bg-[#0d151b]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-9">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
              <Image src="/logo-icon.png" alt="" fill sizes="44px" className="object-cover" />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-wide">BOT STORE</p>
              <p className="text-xs font-semibold text-accent">تسجيل الدخول</p>
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-extrabold lg:mt-0">تسجيل الدخول</h2>
          <p className="mt-2 text-sm leading-7 text-white/45">
            أدخل رقم جوالك ليصلك رمز التحقق عبر واتساب.
          </p>

          <CustomerLoginForm />

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-xs text-white/35">
            <span className="inline-flex items-center gap-1.5">
              <CheckIcon className="size-3.5 text-accent" />
              بدون رسوم أو اشتراكات
            </span>
            <Link
              href="/store"
              className="inline-flex items-center gap-1.5 font-bold transition hover:text-accent"
            >
              العودة للمتجر
              <ArrowIcon className="size-3.5 -scale-x-100" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
