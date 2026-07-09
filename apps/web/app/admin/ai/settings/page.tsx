import { WorkspacePage } from '@/components/layout/workspace-page';

export default function AdminAiSettingsPage() {
  return (
    <WorkspacePage
      role="admin"
      title="Cài đặt AI"
      subtitle="Bật/tắt công cụ AI, đặt giới hạn chi phí và cấu hình nhà cung cấp."
      highlights={['Công tắc từng công cụ', 'Giới hạn token và chi phí', 'Cấu hình nhà cung cấp']}
    />
  );
}
