import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminPackagesPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Gói học"
      subtitle="Tạo, sửa, publish, archive và xóa gói học 1-1."
      highlights={['Bảng quản lý gói học', 'Cờ nổi bật và giá', 'Outcome theo tuần và công cụ AI']}
    />
  );
}
