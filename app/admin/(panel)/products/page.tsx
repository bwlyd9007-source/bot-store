import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductManager } from "@/components/admin/product-manager";
import { getStore } from "@/lib/data";

export default async function AdminProductsPage() {
  const { products } = await getStore();

  return (
    <div>
      <AdminPageHeader
        title="المنتجات"
        description="أضف وعدّل منتجات متجرك: الاسم، السعر، الفئة، الأيقونة والميزات."
      />
      <ProductManager products={products} />
    </div>
  );
}
