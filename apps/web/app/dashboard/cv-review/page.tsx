import { WorkspacePage } from '@/components/layout/workspace-page';

export default function CvReviewPage() {
  return (
    <WorkspacePage
      role="student"
      title="Sửa CV và portfolio"
      subtitle="Tải lên hoặc dán CV/JD, thêm link portfolio/GitHub và nhận phân tích độ phù hợp từ AI."
      highlights={[
        'Điểm tổng quan và keyword còn thiếu',
        'Gợi ý bullet point tốt hơn',
        'Gói học và hạng mục lộ trình được đề xuất',
      ]}
    />
  );
}
