"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deleteOrderAction,
  setOrderStatusAction,
  updateOrderNoteAction,
} from "@/app/admin/actions";
import { CopyButton } from "@/components/copy-button";
import {
  ChatIcon,
  CheckIcon,
  ClipboardCheckIcon,
  CloseIcon,
  DiscordIcon,
  ExternalIcon,
  PhoneIcon,
  ReceiptIcon,
  TrashIcon,
} from "@/components/icons";
import { formatPhoneDisplay, phoneForWhatsApp } from "@/lib/customer";
import { formatDateTime, formatPrice } from "@/lib/products";
import type { StoreOrder } from "@/lib/types";

const filters = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديدة" },
  { key: "done", label: "مكتملة" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export function OrdersTable({ orders }: { orders: StoreOrder[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StoreOrder | null>(null);
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(
    () => ({
      all: orders.length,
      new: orders.filter((order) => order.status === "new").length,
      done: orders.filter((order) => order.status === "done").length,
    }),
    [orders],
  );

  const visible =
    filter === "all" ? orders : orders.filter((order) => order.status === filter);

  const detailOrder = detail
    ? orders.find((order) => order.id === detail.id) ?? detail
    : null;

  useEffect(() => {
    if (!detail) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetail(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [detail]);

  function toggleStatus(order: StoreOrder) {
    setBusyId(order.id);
    startTransition(async () => {
      await setOrderStatusAction(order.id, order.status === "new" ? "done" : "new");
      setBusyId(null);
    });
  }

  function removeOrder(order: StoreOrder) {
    if (
      !window.confirm(
        `حذف الطلب ${order.number} (${order.productName})؟ لا يمكن التراجع.`,
      )
    ) {
      return;
    }
    setBusyId(order.id);
    startTransition(async () => {
      await deleteOrderAction(order.id);
      setBusyId(null);
    });
  }

  function openDetail(order: StoreOrder) {
    setDetail(order);
    setNote(order.note ?? "");
    setNoteStatus("idle");
    setNoteError(null);
  }

  async function saveNote() {
    if (!detail) return;
    setNoteStatus("saving");
    setNoteError(null);
    try {
      await updateOrderNoteAction(detail.id, note);
      setNoteStatus("saved");
    } catch {
      setNoteStatus("idle");
      setNoteError("تعذر حفظ الملاحظة، حاول مرة أخرى.");
    }
  }

  if (orders.length === 0) {
    return (
      <div className="mt-7 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-6 py-16 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/30">
          <ReceiptIcon className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">لا توجد طلبات بعد</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-white/40">
          عندما يضغط عميل على «اطلب» في المتجر، يُسجَّل الطلب هنا تلقائياً مع رقم
          طلب فريد والسعر والقناة والتاريخ.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === item.key
                ? "bg-accent text-[#04242a]"
                : "border border-white/10 bg-white/[0.02] text-white/55 hover:text-white"
            }`}
          >
            {item.label}
            <span className="ms-1.5 opacity-60">{counts[item.key]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] text-white/35">
              <th className="px-5 py-3 text-start font-bold">الطلب</th>
              <th className="px-4 py-3 text-start font-bold">القناة</th>
              <th className="px-4 py-3 text-start font-bold">السعر</th>
              <th className="px-4 py-3 text-start font-bold">التاريخ</th>
              <th className="px-4 py-3 text-start font-bold">الحالة</th>
              <th className="px-5 py-3 text-end font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {visible.map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <OrderThumb order={order} />
                    <div className="min-w-0">
                      <p
                        dir="ltr"
                        className="text-right font-mono text-xs font-extrabold tracking-[0.08em] text-accent"
                      >
                        {order.number}
                      </p>
                      <p className="mt-0.5 truncate font-bold text-white/85">
                        {order.productName}
                      </p>
                      {order.note && (
                        <p className="mt-0.5 max-w-[16rem] truncate text-[11px] text-white/35">
                          ملاحظة: {order.note}
                        </p>
                      )}
                      {order.customerPhone && (
                        <p
                          dir="ltr"
                          className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-white/30"
                        >
                          <PhoneIcon className="size-3" />
                          {formatPhoneDisplay(order.customerPhone)}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <ChannelChip channel={order.channel} />
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-xs font-bold text-white/55">
                  {typeof order.price === "number"
                    ? `${formatPrice(order.price)} ر.س`
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-white/35">
                  {formatDateTime(order.createdAt)}
                </td>
                <td className="px-4 py-3.5">
                  <StatusChip status={order.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDetail(order)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] font-bold text-white/55 transition hover:border-accent/40 hover:text-accent"
                    >
                      <ReceiptIcon className="size-3.5" />
                      تفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleStatus(order)}
                      disabled={busyId === order.id}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] font-bold text-white/55 transition hover:border-accent/40 hover:text-accent disabled:opacity-40"
                    >
                      <CheckIcon className="size-3.5" />
                      {order.status === "new" ? "تم" : "إرجاع"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeOrder(order)}
                      disabled={busyId === order.id}
                      aria-label={`حذف الطلب ${order.number}`}
                      className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-40"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {visible.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <OrderThumb order={order} />
                <div className="min-w-0">
                  <p
                    dir="ltr"
                    className="text-right font-mono text-[11px] font-extrabold tracking-[0.08em] text-accent"
                  >
                    {order.number}
                  </p>
                  <h3 className="mt-0.5 truncate text-sm font-bold text-white/85">
                    {order.productName}
                  </h3>
                </div>
              </div>
              <StatusChip status={order.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <ChannelChip channel={order.channel} />
              {typeof order.price === "number" && (
                <span className="font-bold text-white/50">
                  {formatPrice(order.price)} ر.س
                </span>
              )}
              <span className="text-white/30">{formatDateTime(order.createdAt)}</span>
            </div>

            {order.note && (
              <p className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] leading-5 text-white/45">
                {order.note}
              </p>
            )}

            {order.customerPhone && (
              <a
                href={`https://wa.me/${phoneForWhatsApp(order.customerPhone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5be08d]"
              >
                <PhoneIcon className="size-3.5" />
                <span dir="ltr">{formatPhoneDisplay(order.customerPhone)}</span>
              </a>
            )}

            <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-white/[0.05] pt-3">
              <button
                type="button"
                onClick={() => openDetail(order)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] font-bold text-white/55 transition hover:text-accent"
              >
                <ReceiptIcon className="size-3.5" />
                تفاصيل
              </button>
              <button
                type="button"
                onClick={() => toggleStatus(order)}
                disabled={busyId === order.id}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-[11px] font-bold text-white/55 transition hover:text-accent disabled:opacity-40"
              >
                <CheckIcon className="size-3.5" />
                {order.status === "new" ? "تم" : "إرجاع"}
              </button>
              <button
                type="button"
                onClick={() => removeOrder(order)}
                disabled={busyId === order.id}
                aria-label={`حذف الطلب ${order.number}`}
                className="grid size-8 place-items-center rounded-lg border border-white/10 text-white/50 transition hover:text-red-300 disabled:opacity-40"
              >
                <TrashIcon />
              </button>
            </div>
          </article>
        ))}
      </div>

      {detailOrder && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setDetail(null)}
            className="fixed inset-0 cursor-default bg-black/75 backdrop-blur-sm"
          />
          <div className="animate-pop relative my-6 w-full max-w-xl rounded-3xl border border-white/10 bg-[#0e161c] p-6 shadow-2xl shadow-black/60 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold">تفاصيل الطلب</h2>
                <p className="mt-1 text-xs leading-6 text-white/40">
                  كل ما يخص الطلب في مكان واحد — بيانات العميل، رسالته، وسجل
                  التحديثات محفوظ بالكامل.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                aria-label="إغلاق"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold text-white/45">رقم الطلب</p>
                  <p
                    dir="ltr"
                    className="mt-1 font-mono text-lg font-extrabold tracking-[0.1em] text-accent"
                  >
                    {detailOrder.number}
                  </p>
                </div>
                <CopyButton value={detailOrder.number} className="shrink-0 text-white/60" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
              <OrderThumb order={detailOrder} className="size-12 text-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white/85">
                  {detailOrder.productName}
                </p>
                <p className="mt-0.5 text-xs font-bold text-accent">
                  {typeof detailOrder.price === "number"
                    ? `${formatPrice(detailOrder.price)} ر.س`
                    : "السعر عند التواصل"}
                </p>
              </div>
              <StatusChip status={detailOrder.status} />
            </div>

            <dl className="mt-4 grid gap-2 text-xs">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                <dt className="shrink-0 text-white/40">قناة الطلب</dt>
                <dd>
                  <ChannelChip channel={detailOrder.channel} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                <dt className="shrink-0 text-white/40">جوال العميل</dt>
                <dd className="min-w-0">
                  {detailOrder.customerPhone ? (
                    <span className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${phoneForWhatsApp(detailOrder.customerPhone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#5be08d] hover:underline"
                        dir="ltr"
                      >
                        {formatPhoneDisplay(detailOrder.customerPhone)}
                        <ExternalIcon className="size-3" />
                      </a>
                      <CopyButton
                        value={detailOrder.customerPhone}
                        label="نسخ الرقم"
                        copiedLabel="تم نسخ الرقم"
                        className="text-white/40"
                      />
                    </span>
                  ) : (
                    <span className="text-white/30">لم يُسجَّل رقم</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                <dt className="shrink-0 text-white/40">تاريخ الطلب</dt>
                <dd className="font-semibold text-white/65">
                  {formatDateTime(detailOrder.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                <dt className="shrink-0 text-white/40">معرّف الطلب</dt>
                <dd dir="ltr" className="min-w-0 truncate font-mono text-[10px] text-white/35">
                  {detailOrder.id}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-2xl border border-[#25d366]/20 bg-[#25d366]/[0.05] p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold text-white/70">
                <ChatIcon className="size-4 text-[#5be08d]" />
                رسالة الطلب
                <span className="font-normal text-white/30">
                  — نسخة محفوظة من تفاصيل الطلب
                </span>
              </h3>
              <p className="mt-2.5 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-[#0a1015]/70 px-3.5 py-3 text-[12px] leading-7 text-white/60">
                {detailOrder.message || "لا توجد رسالة محفوظة لهذا الطلب."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold text-white/60">
                <ClipboardCheckIcon className="size-4 text-accent" />
                سجل التحديثات
                <span className="font-normal text-white/30">
                  محفوظ لحفظ الحقوق
                </span>
              </h3>
              <ol className="mt-3 space-y-3">
                {(detailOrder.events ?? []).map((event, index) => (
                  <li key={`${event.at}-${index}`} className="flex gap-3">
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-bold text-white/40">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 border-b border-white/[0.04] pb-2.5">
                      <p className="text-[12px] font-semibold text-white/70">
                        {event.text}
                      </p>
                      <p className="mt-0.5 text-[10px] text-white/30">
                        {formatDateTime(event.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-4">
              <label
                htmlFor="order-note"
                className="text-xs font-bold text-white/60"
              >
                ملاحظات المتابعة
              </label>
              <textarea
                id="order-note"
                value={note}
                maxLength={500}
                onChange={(event) => {
                  setNote(event.target.value);
                  setNoteStatus("idle");
                }}
                rows={3}
                placeholder="سجّل أي مشكلة أو تفاصيل مهمة عن الطلب، مثال: العميل يطلب تعديل الاسم قبل التسليم."
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-accent/60 focus:bg-white/[0.06]"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-white/30">{note.length}/500</span>
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={noteStatus === "saving"}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 text-xs font-extrabold text-[#04242a] transition hover:bg-accent-soft disabled:opacity-60"
                >
                  {noteStatus === "saving"
                    ? "جارٍ الحفظ..."
                    : noteStatus === "saved"
                      ? "تم حفظ الملاحظة"
                      : "حفظ الملاحظة"}
                </button>
              </div>
              {noteError && (
                <p className="mt-1 text-[11px] font-semibold text-red-300">
                  {noteError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelChip({ channel }: { channel: StoreOrder["channel"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        channel === "discord"
          ? "bg-[#5865f2]/15 text-[#8c95ff]"
          : "bg-[#25d366]/15 text-[#5be08d]"
      }`}
    >
      {channel === "discord" ? (
        <DiscordIcon className="size-3.5" />
      ) : (
        <ChatIcon className="size-3.5" />
      )}
      {channel === "discord" ? "ديسكورد" : "واتساب"}
    </span>
  );
}

function StatusChip({ status }: { status: StoreOrder["status"] }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        status === "new"
          ? "bg-accent/15 text-accent"
          : "bg-emerald-500/15 text-emerald-300"
      }`}
    >
      {status === "new" ? "جديد" : "تم"}
    </span>
  );
}

function OrderThumb({
  order,
  className = "size-10 text-lg",
}: {
  order: StoreOrder;
  className?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-xl border border-accent/15 bg-accent/10 ${className}`}
    >
      {order.productImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={order.productImage}
          alt={order.productName}
          className="size-full object-cover"
        />
      ) : (
        <ReceiptIcon className="size-4.5 text-accent/70" />
      )}
    </span>
  );
}
