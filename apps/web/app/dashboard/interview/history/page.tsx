import { WorkspacePage } from '@/components/layout/workspace-page';

export default function InterviewHistoryPage() {
  return (
    <WorkspacePage
      role="student"
      title="Lịch sử phỏng vấn"
      subtitle="Các buổi đã lưu, xu hướng điểm và nhóm điểm yếu lặp lại."
      highlights={['Điểm tổng quan từng buổi', 'Nhóm hóa điểm yếu', 'Gợi ý luyện tập tiếp theo']}
    />
  );
}
