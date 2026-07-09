import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { codingProblems } from '@/lib/showcase-data';

export default function CodePracticeDashboard() {
  return (
    <DashboardShell
      title="Luyện code"
      subtitle="Chọn bài luyện tập, chạy bộ test tự động, nộp lời giải và nhận gợi ý từ AI khi cần."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {codingProblems.map((problem) => (
          <Card key={problem.slug}>
            <div className="flex items-center justify-between">
              <Badge>{problem.difficulty}</Badge>
              <Badge>{problem.solved ? 'Đã giải' : 'Chưa giải'}</Badge>
            </div>
            <CardHeader className="mt-3">
              <CardTitle>{problem.title}</CardTitle>
              <CardDescription>{problem.category}</CardDescription>
            </CardHeader>
            <Link href={`/dashboard/code-practice/${problem.slug}`}>
              <Button>Mở bài</Button>
            </Link>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
