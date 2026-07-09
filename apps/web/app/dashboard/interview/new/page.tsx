import { WorkspacePage } from '@/components/layout/workspace-page';

export default function NewInterviewPage() {
  return (
    <WorkspacePage
      role="student"
      title="Bắt đầu phỏng vấn"
      subtitle="Chọn vai trò mục tiêu, level, chế độ, có thể tải JD và bắt đầu luyện tập."
      highlights={[
        'Chế độ kỹ thuật, hành vi, HR, bảo vệ dự án, tiếng Anh và hỗn hợp',
        'Tạo câu hỏi theo JD',
        'Luồng trả lời bằng text, có thể mở rộng voice input trên browser',
      ]}
    />
  );
}
