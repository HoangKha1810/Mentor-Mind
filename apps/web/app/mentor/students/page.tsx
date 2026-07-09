import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorStudentsPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Học viên phụ trách"
      subtitle="Xem mục tiêu, trình độ, lộ trình, điểm yếu và hoạt động gần đây của học viên."
      highlights={[
        'Tóm tắt hồ sơ học viên',
        'Lộ trình và bài tập đang hoạt động',
        'Insight rủi ro do AI gợi ý',
      ]}
    />
  );
}
