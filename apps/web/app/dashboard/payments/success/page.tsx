import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  return (
    <DashboardShell
      title="Thanh toán thành công"
      subtitle="Hệ thống đã nhận thanh toán và đang cập nhật quyền học của bạn."
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle>Thanh toán đã xác nhận</CardTitle>
          <CardDescription>
            Bạn có thể quay lại dashboard trong lúc hệ thống đồng bộ trạng thái thanh toán mới nhất.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/packages">
            <Button>
              Xem gói học
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Về dashboard</Button>
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
}
