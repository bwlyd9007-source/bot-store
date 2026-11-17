import { cacheLife, cacheTag } from "next/cache";
import { readDb } from "@/lib/db";

export async function getStore() {
  "use cache";
  cacheTag("store");
  cacheLife("max");

  const db = await readDb();
  return {
    products: db.products,
    orders: db.orders,
    settings: db.settings,
  };
}

export async function getCustomerAccount(phone: string) {
  const db = await readDb();
  return {
    customer: db.customers.find((item) => item.phone === phone) ?? null,
    orders: db.orders.filter((order) => order.customerPhone === phone),
  };
}
