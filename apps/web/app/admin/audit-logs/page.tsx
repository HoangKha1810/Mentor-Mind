import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAuditLogsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Nhật ký hệ thống"
      subtitle="Theo dõi các thao tác quan trọng để kiểm soát bảo mật, phân quyền và thay đổi dữ liệu."
      highlights={[
        'Lịch sử đăng nhập và phiên làm việc',
        'Thay đổi người dùng, vai trò và trạng thái tài khoản',
        'Dấu vết duyệt lộ trình, thanh toán và hỗ trợ',
      ]}
    />
  );
}
