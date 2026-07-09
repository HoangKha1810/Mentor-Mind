import { WorkspacePage } from '@/components/layout/workspace-page';

export default function InterviewSessionPage() {
  return (
    <WorkspacePage
      role="student"
      title="Buổi phỏng vấn"
      subtitle="Giao diện trả lời dạng chat, có điểm đánh giá, câu trả lời tốt hơn và thao tác kết thúc buổi."
      highlights={[
        'Câu hỏi phỏng vấn',
        'Ô nhập câu trả lời',
        'Điểm rubric và phản hồi cải thiện câu trả lời',
      ]}
    />
  );
}
