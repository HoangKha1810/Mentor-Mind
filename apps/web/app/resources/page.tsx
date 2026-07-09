import { PageShell } from '@/components/layout/page-shell';
import { PublicFeaturePage } from '@/components/layout/public-feature-page';

export default function PublicResourcesPage() {
  return (
    <PageShell>
      <PublicFeaturePage
        eyebrow="Tài nguyên"
        title="Tìm tài nguyên học bằng AI"
        subtitle="Tìm sách, docs, bài viết, dự án, bài code và gói học phù hợp với mục tiêu của bạn."
        highlights={[
          'Ưu tiên tài nguyên đã curate trong hệ thống',
          'Kết quả bên ngoài được gắn nhãn rõ ràng',
          'AI giải thích vì sao mỗi tài nguyên hữu ích',
        ]}
      />
    </PageShell>
  );
}
