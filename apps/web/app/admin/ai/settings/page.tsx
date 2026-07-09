import { AdminAiSettingsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminAiSettingsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Cài đặt AI"
      subtitle="Bật/tắt công cụ AI, đặt giới hạn chi phí và cấu hình nhà cung cấp."
    >
      <AdminAiSettingsPanel />
    </DashboardShell>
  );
}
