import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getStore } from "@/lib/data";
import { formatDateTime, formatPrice } from "@/lib/products";
import {
  AlertIcon,
  ArrowIcon,
  BoxIcon,
  ChatIcon,
  DiscordIcon,
  ExternalIcon,
  GridIcon,
  PlusIcon,
  ReceiptIcon,
  SettingsIcon,
  StoreIcon,
} from "@/components/icons";

export default async function AdminOverviewPage() {
  const { products, orders } = await getStore();

  const categories = new Set(products.map((product) => product.category)).size;
  const newOrders = orders.filter((order) => order.status === "new").length;
  const recentOrders = orders.slice(0, 5);

  const stats = [
    {
      label: "المنتجات",
      value: products.length,
      hint: "منتجات معروضة في المتجر",
      icon: BoxIcon,
    },
    {
      label: "الفئات",
      value: categories,
      hint: "فئات مختلفة داخل المتجر",
      icon: GridIcon,
    },
    {
      label: "طلبات جديدة",
      value: newOrders,
      hint: "بحاجة إلى متابعة",
      icon: ReceiptIcon,
    },
    {
      label: "إجمالي الطلبات",
      value: orders.length,
      hint: "منذ افتتاح المتجر",
      icon: StoreIcon,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="نظرة عامة"
        description="ملخص سريع لأداء متجرك وحالة المنتجات والطلبات."
        action={
          <Link
            href="/admin/products"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-extrabold text-[#04242a] transition hover:bg-accent-soft"
          >
            <PlusIcon />
            إضافة منتج
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-white/45">{stat.label}</span>
                <span className="grid size-9 place-items-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                  <Icon className="size-4.5" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] text-white/30">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-accent/25 bg-accent/[0.07] px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <AlertIcon className="size-4.5" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">متجرك فارغ حالياً</p>
            <p className="mt-0.5 text-xs leading-6 text-white/50">
              أضف أول منتج ليظهر مباشرة في صفحة المتجر للزوار.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-extrabold text-[#04242a] transition hover:bg-accent-soft"
          >
            إضافة منتج
            <ArrowIcon className="size-3.5 -scale-x-100" />
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-extrabold">أحدث الطلبات</h2>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent transition hover:text-accent-soft"
            >
              عرض الكل
              <ArrowIcon className="size-3.5 -scale-x-100" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/30">
                <ReceiptIcon className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-white/60">لا توجد طلبات بعد</p>
              <p className="mt-1 text-xs leading-6 text-white/35">
                تُسجَّل الطلبات تلقائياً عند ضغط العميل على «اطلب» في المتجر.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      order.channel === "discord"
                        ? "bg-[#5865f2]/15 text-[#8c95ff]"
                        : "bg-[#25d366]/15 text-[#5be08d]"
                    }`}
                  >
                    {order.channel === "discord" ? (
                      <DiscordIcon className="size-4" />
                    ) : (
                      <ChatIcon className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      dir="ltr"
                      className="text-right font-mono text-[11px] font-extrabold tracking-[0.08em] text-accent"
                    >
                      {order.number}
                    </p>
                    <p className="truncate text-sm font-bold text-white/85">
                      {order.productName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/35">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  {typeof order.price === "number" && (
                    <span className="shrink-0 text-xs font-bold text-white/55">
                      {formatPrice(order.price)} ر.س
                    </span>
                  )}
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      order.status === "new"
                        ? "bg-accent/15 text-accent"
                        : "bg-emerald-500/15 text-emerald-300"
                    }`}
                  >
                    {order.status === "new" ? "جديد" : "تم"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h2 className="text-sm font-extrabold">إجراءات سريعة</h2>
          <div className="mt-4 grid gap-2">
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-3.5 py-3 text-xs font-bold text-white/80 transition hover:border-accent/50 hover:text-white"
            >
              <ReceiptIcon className="size-4 text-accent" />
              إدارة الطلبات
              {newOrders > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-[#04242a]">
                  {newOrders} جديد
                </span>
              )}
              <ExternalIcon className="ms-auto size-3.5 text-white/25" />
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-xs font-bold text-white/70 transition hover:border-accent/40 hover:text-white"
            >
              <BoxIcon className="size-4 text-accent" />
              إدارة المنتجات
              <ExternalIcon className="ms-auto size-3.5 text-white/25" />
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-xs font-bold text-white/70 transition hover:border-accent/40 hover:text-white"
            >
              <SettingsIcon className="size-4 text-accent" />
              بيانات التواصل
              <ExternalIcon className="ms-auto size-3.5 text-white/25" />
            </Link>
            <Link
              href="/store"
              target="_blank"
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-xs font-bold text-white/70 transition hover:border-accent/40 hover:text-white"
            >
              <StoreIcon className="size-4 text-accent" />
              معاينة المتجر
              <ExternalIcon className="ms-auto size-3.5 text-white/25" />
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-4">
            <p className="text-[11px] font-bold text-white/40">حالة المتجر</p>
            <p className="mt-1.5 text-xs leading-6 text-white/55">
              {products.length > 0
                ? `المتجر يعرض ${products.length} منتجاً للزوار الآن.`
                : "لم يُضف أي منتج بعد، صفحة المتجر تعرض حالة «قريباً»."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
