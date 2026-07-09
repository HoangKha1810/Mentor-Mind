import { CodeSubmissionsPanel } from '@/components/dashboard/code-practice-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function SubmissionsPage() {
  return (
    <DashboardShell
      title="Lịch sử bài nộp"
      subtitle="Xem kết quả chấm, hiệu năng, test chưa đạt và ghi chú cải thiện từ AI."
    >
      <CodeSubmissionsPanel />
    </DashboardShell>
  );
}
