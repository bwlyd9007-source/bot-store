import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { logoutCustomer } from "@/app/actions/account";
import { CopyButton } from "@/components/copy-button";
import { OrderProvider } from "@/components/order";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProfileForm } from "@/components/customer/profile-form";
import {
  ArrowIcon,
  BoxIcon,
  CheckIcon,
  ChatIcon,
  ClipboardCheckIcon,
  DiscordIcon,
  LogoutIcon,
  ReceiptIcon,
  StoreIcon,
  UserIcon,
} from "@/components/icons";
import { getCustomerPhone } from "@/lib/customer-auth";
import { formatPhoneDisplay } from "@/lib/customer";
import { getCustomerAccount, getStore } from "@/lib/data";
import { formatDate, formatDateTime, formatPrice } from "@/lib/products";
import type { StoreOrder } from "@/lib/types";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "طلباتي والملف التعريفي | BOT STORE",
  description:
    "ملفك التعريفي وطلباتك في BOT STORE — رقم الطلب، اسم المنتج، السعر، وحالة كل طلب.",
};

export default async function AccountPage() {
  const { settings } = await getStore();

  return (
    <OrderProvider settings={settings}>
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/[0.05]">
          <div className="pointer-events-none absolute -top-40 start-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[130px]" />
          <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-1.5 text-xs font-bold text-accent">
              <UserIcon className="size-3.5" />
              طلباتي والملف التعريفي
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-[1.35] sm:text-4xl">
              ملفك التعريفي
              <span className="text-gradient"> وطلباتك</span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/45">
              تابع طلباتك، راجع أرقامها وأسعارها، وحدّث اسمك في أي وقت.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<AccountSkeleton />}>
              <AccountDashboard />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
    </OrderProvider>
  );
}

async function AccountDashboard() {
  await connection();
  const phone = await getCustomerPhone();
  if (!phone) redirect("/login");

  const { customer, orders } = await getCustomerAccount(phone);
  const name = customer?.name?.trim() || null;
  const completed = orders.filter((order) => order.status === "done").length;
  const open = orders.filter((order) => order.status === "new").length;
  const totalSpent = orders.reduce(
    (sum, order) => sum + (typeof order.price === "number" ? order.price : 0),
    0,
  );

  const stats = [
    {
      label: "إجمالي طلباتي",
      value: String(orders.length),
      icon: ReceiptIcon,
    },
    {
      label: "طلبات قيد المتابعة",
      value: String(open),
      icon: BoxIcon,
    },
    {
      label: "طلبات مكتملة",
      value: String(completed),
      icon: CheckIcon,
    },
    {
      label: "إجمالي قيمة الطلبات",
      value: totalSpent > 0 ? `${formatPrice(totalSpent)} ر.س` : "—",
      icon: StoreIcon,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(53,213,239,0.08),rgba(255,255,255,0.02)_45%)] p-5 sm:p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-accent/25 bg-accent/15 text-xl font-extrabold text-accent">
            {name ? name.charAt(0).toUpperCase() : <UserIcon className="size-6" />}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-accent">مرحباً بك</p>
            <h2 className="mt-0.5 truncate text-xl font-extrabold sm:text-2xl">
              {name ?? "عميلنا العزيز"}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/40">
              <span dir="ltr" className="font-mono">
                {formatPhoneDisplay(phone)}
              </span>
              <span className="text-white/15">•</span>
              <span>موثّق عبر واتساب</span>
              {customer?.createdAt && (
                <>
                  <span className="text-white/15">•</span>
                  <span>عضو منذ {formatDate(customer.createdAt)}</span>
                </>
              )}
            </p>
          </div>
        </div>
        <form action={logoutCustomer} className="w-full sm:w-auto">
          <button
            type="submit"
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 text-xs font-bold text-white/55 transition hover:border-red-400/40 hover:text-red-300 sm:w-auto"
          >
            <LogoutIcon className="size-3.5" />
            تسجيل الخروج
          </button>
        </form>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-white/45">
                  {stat.label}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-2.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold">
            <UserIcon className="size-4 text-accent" />
            الملف التعريفي
          </h2>
          <p className="mt-1 text-[11px] leading-6 text-white/35">
            اسمك يظهر هنا وفي تفاصيل طلباتك، ويمكنك تعديله في أي وقت.
          </p>
          <div className="mt-4">
            <ProfileForm phone={phone} name={name} />
          </div>
          {customer?.lastLoginAt && (
            <p className="mt-4 border-t border-white/[0.06] pt-3 text-[10px] text-white/30">
              آخر دخول: {formatDateTime(customer.lastLoginAt)}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <ReceiptIcon className="size-4 text-accent" />
              طلباتي
            </h2>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold text-white/45">
              {orders.length} طلب
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/30">
                <ReceiptIcon className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-white/60">لا توجد طلبات بعد</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-white/35">
                عند طلب أي بوت من المتجر سيظهر هنا برقمه وسعره وحالته.
              </p>
              <Link
                href="/store"
                className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-xs font-extrabold text-[#04242a] transition hover:bg-accent-soft"
              >
                تصفح المتجر
                <ArrowIcon className="size-3.5 -scale-x-100" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {orders.map((order) => (
                <CustomerOrderRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function CustomerOrderRow({ order }: { order: StoreOrder }) {
  const lastEvent = [...(order.events ?? [])]
    .filter((event) => event.type !== "note")
    .at(-1);

  return (
    <li className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/15 bg-accent/10">
          {order.productImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.productImage}
              alt={order.productName}
              className="size-full object-cover"
            />
          ) : (
            <ReceiptIcon className="size-5 text-accent/70" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              dir="ltr"
              className="font-mono text-xs font-extrabold tracking-[0.08em] text-accent"
            >
              {order.number}
            </span>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <CopyButton value={order.number} />
            </div>
          </div>

          <h3 className="mt-1.5 truncate text-sm font-bold text-white/85">
            {order.productName}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            {typeof order.price === "number" && (
              <span className="font-bold text-white/60">
                {formatPrice(order.price)} ر.س
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                order.channel === "discord" ? "text-[#8c95ff]" : "text-[#5be08d]"
              }`}
            >
              {order.channel === "discord" ? (
                <DiscordIcon className="size-3.5" />
              ) : (
                <ChatIcon className="size-3.5" />
              )}
              {order.channel === "discord" ? "ديسكورد" : "واتساب"}
            </span>
            <span className="text-white/30">{formatDateTime(order.createdAt)}</span>
          </div>

          {lastEvent && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] text-white/30">
              <ClipboardCheckIcon className="size-3" />
              آخر تحديث: {lastEvent.text}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ status }: { status: StoreOrder["status"] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        status === "new"
          ? "bg-accent/15 text-accent"
          : "bg-emerald-500/15 text-emerald-300"
      }`}
    >
      {status === "new" ? "قيد المتابعة" : "مكتمل"}
    </span>
  );
}

function AccountSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-24 rounded-3xl border border-white/[0.06] bg-white/[0.03]" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-white/[0.06] bg-white/[0.03]"
          />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="h-72 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    </div>
  );
}
