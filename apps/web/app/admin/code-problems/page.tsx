import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminCodeProblemsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Bài code"
      subtitle="Quản lý ngân hàng bài luyện code, bộ test chấm điểm, gợi ý lời giải và cấu hình Judge0."
      highlights={[
        'Bộ test hiển thị và bộ test chấm kín',
        'Starter code theo từng ngôn ngữ',
        'Giới hạn thời gian, bộ nhớ và độ khó rõ ràng',
      ]}
    />
  );
}
