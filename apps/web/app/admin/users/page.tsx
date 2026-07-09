import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminUsersPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Người dùng"
      subtitle="Quản lý học viên, mentor và admin với bộ lọc role/trạng thái."
      highlights={['Bảng người dùng', 'Bộ lọc role và trạng thái', 'Khóa hoặc kích hoạt tài khoản']}
    />
  );
}
