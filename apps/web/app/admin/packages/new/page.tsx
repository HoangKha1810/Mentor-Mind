import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewPackagePage() {
  return (
    <WorkspacePage
      role="admin"
      title="Tạo gói học"
      subtitle="Editor cho outcome, kỹ năng, loại mentor, giá và trạng thái publish."
      highlights={[
        'Tiêu đề và slug',
        'Đối tượng và vai trò mục tiêu',
        'Cấu hình hero và cờ nổi bật',
      ]}
    />
  );
}
