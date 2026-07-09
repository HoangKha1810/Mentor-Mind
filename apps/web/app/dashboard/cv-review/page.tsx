import { CvReviewPanel } from '@/components/dashboard/cv-review-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function CvReviewPage() {
  return (
    <DashboardShell
      title="Sửa CV và portfolio"
      subtitle="Tải lên hoặc dán CV/JD, thêm link portfolio/GitHub và nhận phân tích độ phù hợp từ AI."
    >
      <CvReviewPanel />
    </DashboardShell>
  );
}
