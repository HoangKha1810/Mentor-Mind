import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminSupportPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Hỗ trợ"
      subtitle="Phản hồi yêu cầu của học viên và cập nhật trạng thái/độ ưu tiên."
      highlights={['Yêu cầu đang mở', 'Admin phụ trách', 'Quy trình trạng thái']}
    />
  );
}
