import { AdminCodeProblemEditorPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function NewCodeProblemPage() {
  return (
    <DashboardShell
      role="admin"
      title="Tạo bài code"
      subtitle="Soạn bài luyện code mới với ví dụ, ràng buộc, bộ test chấm điểm và giải thích lời giải."
    >
      <AdminCodeProblemEditorPanel />
    </DashboardShell>
  );
}
