import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Trung tâm AI"
      subtitle="Biểu đồ sử dụng, chi phí, cuộc gọi lỗi, tình trạng prompt template và trạng thái nhà cung cấp."
      highlights={['Prompt template', 'Log sử dụng và chi phí', 'Bật/tắt từng tính năng']}
    />
  );
}
