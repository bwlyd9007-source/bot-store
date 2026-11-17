import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ExternalIcon, LogoutIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "لوحة التحكم | BOT STORE",
  robots: { index: false, follow: false },
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-e border-white/[0.06] bg-[#0a1116]/90 p-5 backdrop-blur-xl lg:flex">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
            <Image src="/logo-icon.png" alt="" fill sizes="40px" className="object-cover" />
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-wide">BOT STORE</span>
            <span className="block text-[11px] font-semibold text-accent">لوحة التحكم</span>
          </span>
        </Link>

        <AdminNav />

        <div className="mt-auto grid gap-1 border-t border-white/[0.06] pt-4">
          <Link
            href="/store"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalIcon className="size-4" />
            معاينة المتجر
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogoutIcon className="size-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 lg:hidden">
          <div className="flex h-16 items-center justify-between gap-3 border-b border-white/[0.06] bg-[#0b1319]/90 px-4 backdrop-blur-xl">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
                <Image src="/logo-icon.png" alt="" fill sizes="36px" className="object-cover" />
              </span>
              <span className="text-sm font-extrabold tracking-wide">BOT STORE</span>
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                لوحة التحكم
              </span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="تسجيل الخروج"
                className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition hover:text-red-300"
              >
                <LogoutIcon className="size-4" />
              </button>
            </form>
          </div>
          <div className="border-b border-white/[0.06] bg-[#0b1319]/70 backdrop-blur-xl">
            <AdminNav variant="mobile" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
