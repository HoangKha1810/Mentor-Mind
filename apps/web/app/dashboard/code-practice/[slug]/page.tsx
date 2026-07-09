import { CodeEditorPanel } from '@/components/code/code-editor-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CodeProblemPage({ params }: { params: { slug: string } }) {
  return (
    <DashboardShell
      title={params.slug.replaceAll('-', ' ')}
      subtitle="Làm bài trực tiếp, chạy test an toàn và nhận gợi ý AI khi cần cải thiện hướng giải."
    >
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Đề bài</CardTitle>
          <CardDescription>
            Đọc kỹ yêu cầu, hoàn thiện hàm xử lý và dùng kết quả test để tối ưu độ đúng, hiệu năng
            và cách trình bày lời giải.
          </CardDescription>
        </CardHeader>
      </Card>
      <CodeEditorPanel />
    </DashboardShell>
  );
}
