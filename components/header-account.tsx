import Link from "next/link";
import { connection } from "next/server";
import { getCustomerPhone } from "@/lib/customer-auth";
import { UserIcon } from "@/components/icons";

export async function HeaderAccount({
  variant,
}: {
  variant: "desktop" | "mobile";
}) {
  await connection();
  const phone = await getCustomerPhone();
  const href = phone ? "/account" : "/login";
  const label = phone ? "ملف التعريفي" : "تسجيل الدخول";

  if (variant === "mobile") {
    return (
      <Link
        href={href}
        className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-extrabold text-[#052a30]"
      >
        <UserIcon className="size-4" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="hidden h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-xs font-extrabold text-[#052a30] transition hover:bg-accent-soft sm:inline-flex"
    >
      <UserIcon className="size-4" />
      {label}
    </Link>
  );
}

export function HeaderAccountSkeleton({
  variant,
}: {
  variant: "desktop" | "mobile";
}) {
  if (variant === "mobile") {
    return (
      <span className="mt-3 block h-10 animate-pulse rounded-xl bg-white/10" />
    );
  }

  return (
    <span className="hidden h-9 w-32 animate-pulse rounded-full bg-white/10 sm:inline-block" />
  );
}
