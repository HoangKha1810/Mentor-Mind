import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function AiInterviewLanding() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="Phỏng vấn AI"
        title="Luyện phỏng vấn như buổi thật"
        subtitle="Luyện kỹ thuật, hành vi, HR, tiếng Anh và bảo vệ dự án với phản hồi theo rubric."
        highlights={[
          'Tùy biến câu hỏi theo JD',
          'Chấm câu trả lời theo độ đúng, rõ ràng và fit vai trò',
          'Lưu lịch sử và nhóm điểm yếu cần cải thiện',
        ]}
      />
    </PageShell>
  );
}
