import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "@/components/admin/orders-table";
import { getStore } from "@/lib/data";

export default async function AdminOrdersPage() {
  const { orders } = await getStore();

  return (
    <div>
      <AdminPageHeader
        title="الطلبات"
        description="كل طلب يُسجَّل تلقائياً برقم فريد مع المنتج والسعر والقناة، ويمكنك تدوين ملاحظات المتابعة من تفاصيل الطلب."
      />
      <OrdersTable orders={orders} />
    </div>
  );
}
