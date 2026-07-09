import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiUsagePage() {
  return (
    <WorkspacePage
      role="admin"
      title="Log sử dụng AI"
      subtitle="Theo dõi mức sử dụng AI, chi phí, độ trễ và chất lượng phản hồi theo từng tính năng."
      highlights={[
        'Chi phí theo tính năng',
        'Cảnh báo lỗi hoặc phản hồi không đúng định dạng',
        'Kiểm soát ngân sách theo người dùng mỗi ngày',
      ]}
    />
  );
}
