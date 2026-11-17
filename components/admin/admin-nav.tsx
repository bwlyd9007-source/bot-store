"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BoxIcon,
  GridIcon,
  ReceiptIcon,
  SettingsIcon,
  WhatsAppIcon,
} from "@/components/icons";

const links = [
  { href: "/admin", label: "نظرة عامة", icon: GridIcon, exact: true },
  { href: "/admin/products", label: "المنتجات", icon: BoxIcon },
  { href: "/admin/orders", label: "الطلبات", icon: ReceiptIcon },
  { href: "/admin/whatsapp", label: "واتساب", icon: WhatsAppIcon },
  { href: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  if (variant === "mobile") {
    return (
      <nav className="flex gap-1.5 overflow-x-auto px-4 py-3">
        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                active
                  ? "bg-accent text-[#04242a]"
                  : "border border-white/10 bg-white/[0.02] text-white/60"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="mt-6 grid gap-1">
      {links.map((link) => {
        const active = isActive(link.href, link.exact);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-accent/15 text-accent"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="size-4.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
