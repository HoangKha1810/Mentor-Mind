import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { WalletRefreshOnMount } from '@/components/payments/wallet-refresh-on-mount';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  return (
    <DashboardShell
      title="Thanh toán thành công"
      subtitle="Hệ thống đã nhận thanh toán và đang đồng bộ số dư ví của bạn."
    >
      <WalletRefreshOnMount />
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle>Thanh toán đã xác nhận</CardTitle>
          <CardDescription>
            Bạn có thể quay lại dashboard trong lúc hệ thống đồng bộ số dư mới nhất.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Link href="/pricing">
            <Button>
              Xem gói sử dụng
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/dashboard/payments/top-up">
            <Button variant="outline">Về ví</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Về dashboard</Button>
          </Link>
        </div>
      </Card>
    </DashboardShell>
  );
}
