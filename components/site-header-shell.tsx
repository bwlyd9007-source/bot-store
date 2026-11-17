"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { StoreSettings } from "@/lib/types";
import { ChatIcon, CloseIcon, MenuIcon } from "@/components/icons";

const navLinks = [
  { href: "/", label: "الرئيسية", exact: true },
  { href: "/store", label: "المتجر" },
  { href: "/account", label: "طلباتي" },
];

export function SiteHeaderShell({
  settings,
  accountDesktop,
  accountMobile,
}: {
  settings: StoreSettings;
  accountDesktop: ReactNode;
  accountMobile: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-night/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 sm:size-10">
            <Image
              src="/logo-icon.png"
              alt="شعار BOT STORE"
              fill
              sizes="40px"
              priority
              className="object-cover"
            />
          </span>
          <span className="text-base font-extrabold tracking-wide sm:text-lg">
            BOT STORE
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل عبر واتساب"
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:border-accent/40 hover:text-accent"
          >
            <ChatIcon className="size-4" />
          </a>
          {accountDesktop}
          <button
            type="button"
            aria-label="فتح القائمة"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
            className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:text-white lg:hidden"
          >
            {isOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-white/5 bg-night/95 px-4 pb-5 pt-2 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div onClick={() => setIsOpen(false)}>{accountMobile}</div>
        </div>
      )}
    </header>
  );
}
