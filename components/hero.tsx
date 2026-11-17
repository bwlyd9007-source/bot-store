import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, LightningIcon } from "@/components/icons";

const stats = [
  { value: "100%", label: "تخصيص كامل" },
  { value: "فوري", label: "تسليم الطلب" },
  { value: "24/7", label: "دعم فني" },
];

const stack = [
  "discord.js",
  "Node.js",
  "TypeScript",
  "MongoDB",
  "Next.js",
  "Docker",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 end-1/3 size-[36rem] rounded-full bg-accent/[0.08] blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold text-white/70">
            <LightningIcon className="size-4 text-accent" />
            تسليم فوري خلال ثوانٍ
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.3] sm:text-5xl lg:text-[3.5rem]">
            بوتات ديسكورد
            <br />
            <span className="text-gradient">جاهزة للتشغيل</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/55 sm:text-lg">
            اختر ما يحتاجه سيرفرك، ادفع مرة واحدة — بدون انتظار ولا تذاكر.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/store"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-extrabold text-[#04242a] shadow-[0_15px_40px_-15px_rgba(53,213,239,0.8)] transition hover:bg-accent-soft"
            >
              تصفح المتجر
              <ArrowIcon className="size-4 -scale-x-100" />
            </Link>
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-2 py-5 text-center backdrop-blur-sm"
              >
                <div className="text-2xl font-extrabold text-accent">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] font-semibold text-white/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[24rem] lg:max-w-none">
          <div className="animate-glow absolute inset-12 rounded-full bg-accent/15 blur-[70px]" />

          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="absolute inset-0 size-full text-white/15"
            aria-hidden="true"
          >
            <circle
              cx="100"
              cy="100"
              r="98"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="0.7 3.4"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="currentColor"
              strokeWidth="0.4"
              strokeDasharray="0.5 5"
              opacity="0.55"
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <div className="animate-float relative size-36 overflow-hidden rounded-full shadow-[0_0_90px_rgba(53,213,239,0.3)] ring-1 ring-white/10 sm:size-40">
              <Image
                src="/logo-icon.png"
                alt="شعار BOT STORE"
                fill
                sizes="160px"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-y border-white/5 bg-white/[0.015]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 sm:px-6 lg:px-8">
          {stack.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
