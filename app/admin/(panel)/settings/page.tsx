import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForms } from "@/components/admin/settings-forms";
import { getStore } from "@/lib/data";

export default async function AdminSettingsPage() {
  const { settings } = await getStore();

  return (
    <div>
      <AdminPageHeader
        title="الإعدادات"
        description="تحكم في بيانات التواصل الظاهرة للزوار وأمان لوحة التحكم."
      />
      <SettingsForms settings={settings} />
    </div>
  );
}
