import Image from "next/image";
import Link from "next/link";
import type { StoreSettings } from "@/lib/types";
import { ArrowIcon, DiscordIcon } from "@/components/icons";

export function Cta({ settings }: { settings: StoreSettings }) {
  return (
    <section className="pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-gradient-to-br from-accent/10 via-night-2 to-night px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -top-24 start-1/2 size-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />

          <Image
            src="/bot-store-logo.png"
            alt="شعار BOT STORE"
            width={1254}
            height={1254}
            className="relative mx-auto mb-6 h-24 w-24 object-contain drop-shadow-[0_12px_45px_rgba(53,213,239,0.35)] sm:h-28 sm:w-28"
          />

          <h2 className="relative text-3xl font-extrabold leading-snug sm:text-4xl">
            جاهز تختار بوت سيرفرك؟
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-base leading-8 text-white/55">
            تصفح المتجر واختر البوت المناسب — التسليم فوري والتركيب خلال دقائق.
          </p>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/store"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-8 text-base font-extrabold text-[#04242a] shadow-[0_15px_40px_-15px_rgba(53,213,239,0.8)] transition hover:bg-accent-soft"
            >
              تصفح المتجر
              <ArrowIcon className="size-4 -scale-x-100" />
            </Link>
            <a
              href={settings.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 text-sm font-bold text-white transition hover:border-accent/40 hover:bg-white/[0.07]"
            >
              <DiscordIcon className="size-4" />
              انضم إلى ديسكورد
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
