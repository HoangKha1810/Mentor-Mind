import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiPromptsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Prompt template AI"
      subtitle="Sửa, tạo phiên bản và test prompt cho lộ trình, phỏng vấn, code, tài nguyên và sửa CV."
      highlights={['Sinh lộ trình', 'Đánh giá code', 'Trợ lý học tập']}
    />
  );
}
