import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function CodePracticeLanding() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="Luyện code"
        title="Luyện thuật toán với AI"
        subtitle="Giải bài bằng Monaco, chấm tự động bằng Judge0, nhận gợi ý thông minh và đánh giá code sau mỗi lần nộp."
        highlights={[
          'Chạy code trong môi trường sandbox an toàn',
          'Gợi ý từng mức để học viên vẫn tự tư duy lời giải',
          'Đánh giá code theo độ đúng, trường hợp biên và độ rõ ràng',
        ]}
      />
    </PageShell>
  );
}
