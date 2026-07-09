import { WorkspacePage } from '@/components/layout/workspace-page';

export default function EditPackagePage() {
  return (
    <WorkspacePage
      role="admin"
      title="Sửa gói học"
      subtitle="Cập nhật chi tiết gói, trạng thái và thông điệp tư vấn."
      highlights={['Nháp/publish/archive', 'Giá và số buổi', 'Công cụ AI đi kèm']}
    />
  );
}
