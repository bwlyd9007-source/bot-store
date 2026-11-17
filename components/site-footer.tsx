import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import type { StoreSettings } from "@/lib/types";
import { ChatIcon, DiscordIcon } from "@/components/icons";
import { getCustomerPhone } from "@/lib/customer-auth";

const quickLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/store", label: "المتجر" },
];

async function FooterAccountLink() {
  await connection();
  const phone = await getCustomerPhone();
  return (
    <Link
      href={phone ? "/account" : "/login"}
      className="transition hover:text-accent"
    >
      {phone ? "ملف التعريفي" : "تسجيل الدخول"}
    </Link>
  );
}

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="border-t border-white/[0.05] bg-[#0a1015]/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image
                  src="/logo-icon.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="text-lg font-extrabold tracking-wide">
                BOT STORE
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/45">
              متجر بوتات ديسكورد: بوتات جاهزة للتركيب، تسليم فوري، ودعم فني
              مستمر بعد الشراء.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">روابط سريعة</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/45">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Suspense
                  fallback={
                    <span className="inline-block h-4 w-24 animate-pulse rounded bg-white/10" />
                  }
                >
                  <FooterAccountLink />
                </Suspense>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">تواصل معنا</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/45">
              <li>
                <a
                  href={settings.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-accent"
                >
                  <DiscordIcon className="size-4 text-accent" />
                  سيرفر ديسكورد
                </a>
              </li>
              <li>
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition hover:text-accent"
                >
                  <ChatIcon className="size-4 text-accent" />
                  واتساب
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-white/30 sm:flex-row">
          <p>© 2026 BOT STORE — جميع الحقوق محفوظة.</p>
          <p>صُنع لمجتمع ديسكورد العربي</p>
        </div>
      </div>
    </footer>
  );
}
