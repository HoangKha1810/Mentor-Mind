import { AdminAiPromptsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminAiPromptsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Prompt template AI"
      subtitle="Sửa, tạo phiên bản và test prompt cho lộ trình, phỏng vấn, code, tài nguyên và sửa CV."
    >
      <AdminAiPromptsPanel />
    </DashboardShell>
  );
}
