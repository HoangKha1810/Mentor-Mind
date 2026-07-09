import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminMentorsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Mentor"
      subtitle="Danh sách mentor, phân công và tổng quan lịch rảnh."
      highlights={['Tóm tắt lịch rảnh', 'Bộ lọc kỹ năng/chuyên mục', 'Học viên được phân công']}
    />
  );
}
