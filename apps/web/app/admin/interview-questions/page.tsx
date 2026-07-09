import { AdminInterviewQuestionsPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AdminInterviewQuestionsPage() {
  return (
    <DashboardShell
      role="admin"
      title="Câu hỏi phỏng vấn"
      subtitle="Quản lý bộ câu hỏi kỹ thuật, hành vi, HR, tiếng Anh và bảo vệ dự án theo vai trò."
    >
      <AdminInterviewQuestionsPanel />
    </DashboardShell>
  );
}
