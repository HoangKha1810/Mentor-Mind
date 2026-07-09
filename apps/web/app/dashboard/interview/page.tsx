import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InterviewDashboard() {
  return (
    <DashboardShell
      title="Phỏng vấn AI"
      subtitle="Bắt đầu phỏng vấn thử, theo dõi xu hướng điểm và xem các điểm yếu lặp lại."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {['Phỏng vấn kỹ thuật', 'Bảo vệ dự án', 'Phỏng vấn tiếng Anh'].map((mode) => (
          <Card key={mode}>
            <CardHeader>
              <CardTitle>{mode}</CardTitle>
              <CardDescription>
                Câu hỏi theo vai trò, phản hồi theo rubric và gợi ý câu trả lời tốt hơn.
              </CardDescription>
            </CardHeader>
            <Link href="/dashboard/interview/new">
              <Button>
                <MessageSquarePlus className="h-4 w-4" />
                Bắt đầu
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
