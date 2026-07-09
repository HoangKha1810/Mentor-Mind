import { AdminCodeProblemEditorPanel } from '@/components/admin/admin-panels';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function EditCodeProblemPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell
      role="admin"
      title="Sửa bài code"
      subtitle="Cập nhật nội dung bài, tag, test case và trạng thái xuất bản."
    >
      <AdminCodeProblemEditorPanel id={params.id} />
    </DashboardShell>
  );
}
