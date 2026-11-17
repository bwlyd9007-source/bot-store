import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ArrowIcon } from "@/components/icons";
import { OrderProvider } from "@/components/order";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreCatalog } from "@/components/store-catalog";
import { getCustomerPhone } from "@/lib/customer-auth";
import { getStore } from "@/lib/data";

async function StoreAccountCta() {
  await connection();
  const phone = await getCustomerPhone();
  return (
    <Link
      href={phone ? "/account" : "/login"}
      className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-accent transition hover:text-accent-soft"
    >
      {phone ? "عرض طلباتي" : "لديك طلب سابق؟ سجّل الدخول لمتابعة طلباتك"}
      <ArrowIcon className="size-3.5 -scale-x-100" />
    </Link>
  );
}

export const metadata: Metadata = {
  title: "المتجر | BOT STORE",
  description:
    "تصفح بوتات ديسكورد الجاهزة للتركيب — أسعار واضحة، تسليم فوري، ودعم فني مستمر.",
};

export default async function StorePage() {
  const { products, settings } = await getStore();

  return (
    <OrderProvider settings={settings}>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="pointer-events-none absolute -top-40 start-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[130px]" />

          <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 text-center sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
              المتجر
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold leading-[1.3] sm:text-5xl">
              بوتات ديسكورد
              <span className="text-gradient"> جاهزة للتركيب</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50">
              اختر البوت المناسب لسيرفرك — كل منتج يأتي مع الشرح الكامل وخطوات
              التركيب، والدعم بعد الشراء.
            </p>
            <Suspense
              fallback={
                <span className="mt-5 inline-block h-4 w-56 animate-pulse rounded bg-white/10" />
              }
            >
              <StoreAccountCta />
            </Suspense>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <StoreCatalog products={products} />
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </OrderProvider>
  );
}
