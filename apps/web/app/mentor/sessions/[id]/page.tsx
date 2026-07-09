import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorSessionDetailPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Chi tiết buổi học"
      subtitle="Thêm ghi chú, giao bài tập và xem lại bối cảnh buổi học trước."
      highlights={['Ghi chú buổi học', 'Điểm mạnh và điểm yếu', 'Bước tiếp theo và ghi chú riêng']}
    />
  );
}
