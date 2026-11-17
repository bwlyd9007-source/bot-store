import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_MAX_AGE,
  createCustomerToken,
  verifyCustomerToken,
} from "@/lib/customer-session";

export async function getCustomerPhone() {
  const cookieStore = await cookies();
  return verifyCustomerToken(cookieStore.get(CUSTOMER_COOKIE)?.value);
}

export async function startCustomerSession(phone: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE, createCustomerToken(phone), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function endCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}
