import Link from 'next/link';
import { ArrowRight, XCircle } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancelPage() {
  return (
    <DashboardShell
      title="Thanh toán đã hủy"
      subtitle="Phiên thanh toán đã bị hủy trước khi hoàn tất."
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-danger/10 text-danger">
            <XCircle className="h-6 w-6" />
          </div>
          <CardTitle>Đã hủy thanh toán</CardTitle>
          <CardDescription>
            Chưa có giao dịch nào được hoàn tất. Bạn có thể quay lại gói học và thanh toán lại khi
            sẵn sàng.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/payments/top-up">
            <Button>
              Nạp lại
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline">Xem gói sử dụng</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Về dashboard</Button>
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
}
