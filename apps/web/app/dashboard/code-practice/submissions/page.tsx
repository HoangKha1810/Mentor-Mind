import { WorkspacePage } from '@/components/layout/workspace-page';

export default function SubmissionsPage() {
  return (
    <WorkspacePage
      role="student"
      title="Lịch sử bài nộp"
      subtitle="Xem kết quả chấm, hiệu năng, test chưa đạt và ghi chú cải thiện từ AI."
      highlights={[
        'Kết quả đúng/sai cho từng lần nộp',
        'AI đánh giá theo từng bài nộp',
        'Theo dõi bài đã giải',
      ]}
    />
  );
}
