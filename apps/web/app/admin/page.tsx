import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { adminStats } from '@/lib/showcase-data';

export default function AdminOverviewPage() {
  return (
    <DashboardShell
      role="admin"
      title="Tổng quan quản trị"
      subtitle="Bảng điều khiển vận hành cho duyệt lộ trình, mức sử dụng AI, lịch học, doanh thu và hỗ trợ."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phễu chuyển đổi</CardTitle>
            <CardDescription>
              Từ khách truy cập, đăng ký, gửi yêu cầu lộ trình, tư vấn đến kế hoạch đang học.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mức sử dụng và chi phí AI</CardTitle>
            <CardDescription>
              Prompt template, lỗi gọi AI và giới hạn ngân sách hằng ngày nằm trong Trung tâm AI.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}
