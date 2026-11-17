import { Suspense } from "react";
import { HeaderAccount, HeaderAccountSkeleton } from "@/components/header-account";
import { SiteHeaderShell } from "@/components/site-header-shell";
import type { StoreSettings } from "@/lib/types";

export function SiteHeader({ settings }: { settings: StoreSettings }) {
  return (
    <SiteHeaderShell
      settings={settings}
      accountDesktop={
        <Suspense fallback={<HeaderAccountSkeleton variant="desktop" />}>
          <HeaderAccount variant="desktop" />
        </Suspense>
      }
      accountMobile={
        <Suspense fallback={<HeaderAccountSkeleton variant="mobile" />}>
          <HeaderAccount variant="mobile" />
        </Suspense>
      }
    />
  );
}
