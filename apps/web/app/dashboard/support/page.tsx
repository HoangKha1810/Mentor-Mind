import { WorkspacePage } from '@/components/layout/workspace-page';

export default function SupportPage() {
  return (
    <WorkspacePage
      role="student"
      title="Yêu cầu hỗ trợ"
      subtitle="Gửi vấn đề cần hỗ trợ và theo dõi phản hồi/trạng thái từ admin."
      highlights={['Tạo ticket', 'Xem ticket của tôi', 'Quy trình cập nhật trạng thái của admin']}
    />
  );
}
