import { WorkspacePage } from '@/components/layout/workspace-page';

export default function MentorHomeworkPage() {
  return (
    <WorkspacePage
      role="mentor"
      title="Chấm bài tập"
      subtitle="Danh sách bài tập đã nộp đang cần mentor phản hồi và chấm điểm."
      highlights={[
        'Nội dung bài nộp',
        'Nhận xét và điểm số',
        'Thông báo cho học viên sau khi review',
      ]}
    />
  );
}
