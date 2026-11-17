import { Suspense } from "react";
import { connection } from "next/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { WhatsAppPanel } from "@/components/admin/whatsapp-panel";
import { getWhatsAppStatus } from "@/lib/whatsapp";

async function WhatsAppPanelLoader() {
  await connection();
  const status = await getWhatsAppStatus();
  return <WhatsAppPanel initialStatus={status} />;
}

function PanelSkeleton() {
  return (
    <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="grid content-start gap-5">
        <div className="h-52 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.02]" />
        <div className="h-36 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.02]" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.02]" />
    </div>
  );
}

export default function AdminWhatsAppPage() {
  return (
    <div>
      <AdminPageHeader
        title="واتساب"
        description="اربط رقم واتساب المتجر ليستلم العملاء رموز الدخول ويتم إرسالها من رقمك الرسمي."
      />
      <Suspense fallback={<PanelSkeleton />}>
        <WhatsAppPanelLoader />
      </Suspense>
    </div>
  );
}
