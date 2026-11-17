"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckIcon,
  CloseIcon,
  EyeIcon,
  SparkIcon,
  StoreIcon,
} from "@/components/icons";
import { OrderButton, useOrder } from "@/components/order";
import { formatPrice } from "@/lib/products";
import type { Product } from "@/lib/types";

const allCategory = "الكل";

export function StoreCatalog({ products }: { products: Product[] }) {
  const [active, setActive] = useState<string>(allCategory);
  const [details, setDetails] = useState<Product | null>(null);
  const { openOrder } = useOrder();

  useEffect(() => {
    if (!details) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetails(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [details]);

  const categories = useMemo(
    () => [
      allCategory,
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );

  const filtered =
    active === allCategory
      ? products
      : products.filter((product) => product.category === active);

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-white/12 bg-white/[0.015] px-6 py-16 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
          <StoreIcon className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">المتجر قيد التجهيز</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-8 text-white/45">
          نجهّز حالياً أول مجموعة من البوتات والخدمات. تواصل معنا لمعرفة
          المتوفر أو لحجز طلبك مسبقاً.
        </p>
        <div className="mt-7 flex justify-center">
          <OrderButton
            label="تواصل معنا"
            className="h-12 rounded-2xl px-8 text-base"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
              active === category
                ? "bg-accent text-[#04242a] shadow-[0_10px_30px_-12px_rgba(53,213,239,0.8)]"
                : "border border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <article
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.04] hover:shadow-[0_25px_70px_-30px_rgba(53,213,239,0.4)]"
          >
            {product.image ? (
              <div className="relative -mx-6 -mt-6 mb-5 border-b border-white/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1419]/75 via-transparent to-transparent" />
                <span className="absolute bottom-3 start-4 grid size-10 place-items-center rounded-xl border border-white/15 bg-black/45 text-lg backdrop-blur-sm">
                  {product.emoji}
                </span>
                <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                  {product.badge ? (
                    <span className="rounded-full border border-accent/40 bg-[#07141a]/80 px-3 py-1 text-[11px] font-bold text-accent backdrop-blur-sm">
                      {product.badge}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="rounded-full border border-white/15 bg-[#07141a]/80 px-2.5 py-0.5 text-[10px] font-semibold text-white/60 backdrop-blur-sm">
                    {product.category}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-14 place-items-center rounded-2xl border border-accent/15 bg-accent/10 text-2xl">
                  {product.emoji}
                </span>
                <div className="flex flex-col items-end gap-1.5">
                  {product.badge && (
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                      {product.badge}
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/40">
                    {product.category}
                  </span>
                </div>
              </div>
            )}

            <h3 className="mt-5 text-xl font-extrabold">{product.name}</h3>
            {product.tagline && (
              <p className="mt-2 text-sm leading-7 text-white/50">
                {product.tagline}
              </p>
            )}

            {product.features.length > 0 && (
              <ul className="mt-5 space-y-2.5 pb-6 text-sm text-white/65">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                      <CheckIcon className="size-3" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs font-semibold text-white/45">ر.س</span>
                </div>
                <span className="mt-0.5 block text-[11px] text-white/30">
                  دفعة واحدة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetails(product)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-bold text-white/65 transition hover:border-accent/40 hover:text-white"
                >
                  <EyeIcon className="size-4" />
                  التفاصيل
                </button>
                <OrderButton
                  target={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    emoji: product.emoji,
                    image: product.image,
                  }}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-white/40">
          لا توجد منتجات في هذه الفئة حالياً.
        </p>
      )}

      {details && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setDetails(null)}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-details-title"
            className="animate-pop relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0e161c] shadow-2xl shadow-black/60"
          >
            <button
              type="button"
              onClick={() => setDetails(null)}
              aria-label="إغلاق تفاصيل المنتج"
              className="absolute end-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-sm transition hover:text-accent"
            >
              <CloseIcon />
            </button>

            {details.image ? (
              <div className="relative border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={details.image}
                  alt={details.name}
                  className="h-52 w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0e161c] via-[#0e161c]/20 to-transparent" />
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center border-b border-white/10 bg-accent/[0.05] text-4xl">
                {details.emoji}
              </div>
            )}

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-bold text-accent">
                  {details.category}
                </span>
                {details.badge && (
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/60">
                    {details.badge}
                  </span>
                )}
              </div>

              <h2
                id="product-details-title"
                className="mt-4 text-2xl font-extrabold"
              >
                {details.name}
              </h2>
              {details.tagline && (
                <p className="mt-2 text-sm leading-7 text-white/50">
                  {details.tagline}
                </p>
              )}

              {details.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-white/65">
                  {details.description}
                </p>
              ) : (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-white/35">
                  <SparkIcon className="mt-0.5 size-4 shrink-0 text-accent" />
                  التفاصيل الكاملة لهذا المنتج متاحة عبر التواصل — راسلنا وسنوضح
                  لك كل ما تحتاجه قبل الطلب.
                </p>
              )}

              {details.features.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold text-white/45">أهم الميزات</p>
                  <ul className="mt-3 grid gap-2.5 text-sm text-white/70">
                    {details.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                          <CheckIcon className="size-3" />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold">
                    {formatPrice(details.price)}
                  </span>
                  <span className="text-xs font-semibold text-white/45">ر.س</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetails(null)}
                    className="h-11 rounded-xl border border-white/10 px-4 text-xs font-bold text-white/55 transition hover:text-white"
                  >
                    إغلاق
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const product = details;
                      setDetails(null);
                      openOrder({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        emoji: product.emoji,
                        image: product.image,
                      });
                    }}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-extrabold text-[#04242a] shadow-[0_12px_35px_-12px_rgba(53,213,239,0.85)] transition hover:bg-accent-soft"
                  >
                    اطلب الآن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
