import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminInterviewQuestionsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Câu hỏi phỏng vấn"
      subtitle="Quản lý bộ câu hỏi kỹ thuật, hành vi, HR, tiếng Anh và bảo vệ dự án theo vai trò."
      highlights={['Ý chính cần có trong câu trả lời', 'Câu trả lời mẫu', 'Lỗi thường gặp và tag']}
    />
  );
}
