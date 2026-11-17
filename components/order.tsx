"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { recordOrder } from "@/app/actions/orders";
import { getSessionCustomer } from "@/app/actions/account";
import { CopyButton } from "@/components/copy-button";
import { formatPhoneDisplay, normalizeSaudiPhone } from "@/lib/customer";
import { generateOrderNumber } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import type { StoreSettings } from "@/lib/types";
import {
  ArrowIcon,
  ChatIcon,
  CloseIcon,
  DiscordIcon,
  PhoneIcon,
  SparkIcon,
} from "@/components/icons";

export type OrderTarget = {
  id?: string;
  name: string;
  price?: number;
  emoji?: string;
  image?: string;
};

type OrderContextValue = {
  openOrder: (target?: OrderTarget) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}

export function OrderProvider({
  children,
  settings,
}: {
  children: React.ReactNode;
  settings: StoreSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<OrderTarget | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const recorded = useRef(false);

  const openOrder = useCallback((next?: OrderTarget) => {
    setTarget(next ?? null);
    setOrderNumber(next ? generateOrderNumber() : null);
    setPhoneError(null);
    recorded.current = false;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen || phone) return;
    let active = true;
    void getSessionCustomer()
      .then((customer) => {
        if (active && customer?.phone) setPhone(customer.phone);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen, phone]);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  const normalizedPhone = useMemo(() => normalizeSaudiPhone(phone), [phone]);

  const orderMessage = useMemo(() => {
    if (!target) return "مرحباً، أرغب بالاستفسار عن خدمات BOT STORE";

    return [
      `مرحباً، أرغب بطلب: ${target.name}${
        typeof target.price === "number"
          ? ` (${formatPrice(target.price)} ر.س)`
          : ""
      }`,
      orderNumber ? `رقم الطلب: ${orderNumber}` : "",
      normalizedPhone ? `رقم الجوال: ${formatPhoneDisplay(normalizedPhone)}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [target, orderNumber, normalizedPhone]);

  const whatsappHref = useMemo(
    () => `${settings.whatsappUrl}?text=${encodeURIComponent(orderMessage)}`,
    [settings.whatsappUrl, orderMessage],
  );

  function guardPhone(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!target || normalizedPhone) return true;
    event.preventDefault();
    setPhoneError(
      phone.trim()
        ? "الرقم غير صحيح — أدخل رقماً سعودياً مثل 0512345678."
        : "أدخل رقم جوالك لإتمام الطلب (مثال: 0512345678).",
    );
    return false;
  }

  function track(channel: "whatsapp" | "discord") {
    if (!target || recorded.current) return;
    recorded.current = true;

    void recordOrder({
      productId: target.id,
      productName: target.name,
      productImage: target.image,
      price: target.price,
      channel,
      number: orderNumber ?? undefined,
      customerPhone: normalizedPhone ?? undefined,
      message: orderMessage,
    }).catch(() => {});

    if (channel === "discord" && orderNumber) {
      void navigator.clipboard?.writeText(orderNumber).catch(() => {});
    }
  }

  const value = useMemo(() => ({ openOrder }), [openOrder]);

  return (
    <OrderContext.Provider value={value}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-title"
            className="animate-pop relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0e161c] p-6 shadow-2xl shadow-black/60 sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="إغلاق نافذة الطلب"
              className="absolute end-4 top-4 grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:text-accent"
            >
              <CloseIcon />
            </button>

            <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent">
              <SparkIcon className="size-6" />
            </span>

            <h3 id="order-title" className="mt-4 text-2xl font-extrabold text-white">
              إتمام الطلب
            </h3>
            <p className="mt-2 text-sm leading-7 text-white/55">
              اختر طريقة التواصل وسنرد عليك خلال دقائق لتأكيد التفاصيل والدفع.
            </p>

            {target && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="flex min-w-0 items-center gap-3 text-sm font-bold text-white">
                  {target.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={target.image}
                      alt={target.name}
                      className="size-11 shrink-0 rounded-xl border border-white/10 object-cover"
                    />
                  ) : (
                    target.emoji && <span className="text-lg">{target.emoji}</span>
                  )}
                  <span className="truncate">{target.name}</span>
                </span>
                {typeof target.price === "number" && (
                  <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
                    {formatPrice(target.price)} ر.س
                  </span>
                )}
              </div>
            )}

            {target && orderNumber && (
              <div className="mt-3 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-white/45">رقم الطلب</p>
                    <p
                      dir="ltr"
                      className="mt-1 font-mono text-lg font-extrabold tracking-[0.1em] text-accent"
                    >
                      {orderNumber}
                    </p>
                  </div>
                  <CopyButton value={orderNumber} className="shrink-0 text-white/60" />
                </div>
                <p className="mt-2.5 text-[11px] leading-5 text-white/40">
                  احتفظ بهذا الرقم واذكره عند التواصل معنا بخصوص أي مشكلة في الطلب.
                </p>
              </div>
            )}

            {target && (
              <div className="mt-3">
                <label
                  htmlFor="order-phone"
                  className="flex items-center gap-2 text-xs font-bold text-white/70"
                >
                  <PhoneIcon className="size-4 text-accent" />
                  رقم الجوال
                  <span className="text-accent">*</span>
                </label>
                <input
                  id="order-phone"
                  name="phone"
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby="order-phone-hint"
                  className={`mt-2 h-11 w-full rounded-xl border bg-white/[0.04] px-3 text-start font-mono text-sm tracking-[0.06em] text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06] ${
                    phoneError ? "border-red-400/60" : "border-white/10"
                  }`}
                />
                {phoneError ? (
                  <p className="mt-1.5 text-[11px] font-bold text-red-300">
                    {phoneError}
                  </p>
                ) : (
                  <p
                    id="order-phone-hint"
                    className="mt-1.5 text-[11px] leading-5 text-white/35"
                  >
                    {normalizedPhone
                      ? `سيُرسل رقم الطلب إلى واتساب ${formatPhoneDisplay(normalizedPhone)} ويمكنك متابعته من «طلباتي».`
                      : "نربط الطلب برقمك ليظهر في «طلباتي» بعد تسجيل الدخول، ونستخدمه للمتابعة عند أي مشكلة."}
                  </p>
                )}
              </div>
            )}

            <div className="mt-5 grid gap-3">
              <a
                href={settings.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (guardPhone(event)) track("discord");
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-[#04242a] transition hover:bg-accent-soft"
              >
                <DiscordIcon />
                الطلب عبر ديسكورد
                <ArrowIcon className="size-4 opacity-60" />
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (guardPhone(event)) track("whatsapp");
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25d366] text-sm font-bold text-[#052e16] transition hover:bg-[#1fb959]"
              >
                <ChatIcon />
                الطلب عبر واتساب
                <ArrowIcon className="size-4 opacity-60" />
              </a>
            </div>

            <p className="mt-4 text-center text-xs leading-6 text-white/35">
              {target
                ? orderNumber
                  ? "عند اختيار ديسكورد ننسخ رقم الطلب تلقائياً — ألصقه في المحادثة."
                  : "اذكر اسم المنتج عند التواصل لتسريع طلبك."
                : "تواصل معنا وسنساعدك في اختيار ما يناسب سيرفرك."}
            </p>
          </div>
        </div>
      )}
    </OrderContext.Provider>
  );
}

export function OrderButton({
  label = "اطلب الآن",
  target,
  variant = "primary",
  className = "",
}: {
  label?: string;
  target?: OrderTarget;
  variant?: "primary" | "ghost" | "soft";
  className?: string;
}) {
  const { openOrder } = useOrder();

  const base =
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-accent text-[#04242a] shadow-[0_12px_35px_-12px_rgba(53,213,239,0.85)] hover:bg-accent-soft",
    ghost:
      "border border-white/10 bg-white/[0.04] text-white hover:border-accent/40 hover:bg-white/[0.07]",
    soft: "bg-white/10 text-white hover:bg-white/15",
  };

  return (
    <button
      type="button"
      onClick={() => openOrder(target)}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {label}
    </button>
  );
}
