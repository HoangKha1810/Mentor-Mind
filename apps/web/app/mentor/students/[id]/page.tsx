import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorStudentDetailPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Chi tiết học viên"
      subtitle="Lộ trình, buổi học, bài tập, ghi chú trước đó và insight học tập AI của một học viên."
      highlights={[
        'Bối cảnh mục tiêu và trình độ',
        'Hạng mục lộ trình mentor có thể chỉnh',
        'Tài nguyên đề xuất',
      ]}
    />
  );
}
