import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { CUSTOMER_COOKIE, verifyCustomerToken } from "@/lib/customer-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const customerPhone = verifyCustomerToken(
    request.cookies.get(CUSTOMER_COOKIE)?.value,
  );

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login") {
    if (customerPhone) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    if (!customerPhone) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const authenticated = verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account", "/account/:path*", "/login", "/register"],
};
