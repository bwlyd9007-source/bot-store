"use server";

import { updateTag } from "next/cache";
import { newId, updateDb } from "@/lib/db";
import { normalizeSaudiPhone } from "@/lib/customer";
import { notifyNewOrder } from "@/lib/discord";
import { uniqueOrderNumber } from "@/lib/orders";
import { sanitizeImage } from "@/lib/products";
import type { StoreOrder } from "@/lib/types";

export async function recordOrder(input: {
  productId?: string;
  productName: string;
  productImage?: string;
  price?: number;
  channel: "whatsapp" | "discord";
  number?: string;
  customerPhone?: string;
  message?: string;
}) {
  const productName = input.productName?.trim().slice(0, 120);
  if (!productName) return null;

  const channel = input.channel === "discord" ? "discord" : "whatsapp";
  const createdAt = new Date().toISOString();

  const order = await updateDb((db) => {
    const taken = new Set(db.orders.map((item) => item.number));
    const number = uniqueOrderNumber(taken, input.number);

    const next: StoreOrder = {
      id: newId(),
      number,
      productId: input.productId,
      productName,
      productImage: sanitizeImage(input.productImage),
      price:
        typeof input.price === "number" && Number.isFinite(input.price)
          ? input.price
          : undefined,
      channel,
      status: "new",
      customerPhone: normalizeSaudiPhone(input.customerPhone) ?? undefined,
      message: input.message?.trim().slice(0, 1000) || undefined,
      events: [
        {
          at: createdAt,
          type: "created",
          text: `تم إنشاء الطلب عبر ${channel === "discord" ? "ديسكورد" : "واتساب"}`,
        },
      ],
      createdAt,
    };

    db.orders = [next, ...db.orders].slice(0, 500);
    return next;
  });

  updateTag("store");

  try {
    await notifyNewOrder(order);
  } catch {
    // إشعار ديسكورد اختياري — لا يمنع إتمام الطلب عند فشله
  }

  return { number: order.number };
}
