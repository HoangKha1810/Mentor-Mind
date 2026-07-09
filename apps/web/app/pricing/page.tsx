import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const plans = ['Tư vấn khởi động', 'Lộ trình AI', 'Mentor 1-1', 'Bootcamp đi làm', 'Gói tùy chỉnh'];

export default function PricingPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-white">Bảng giá minh bạch cho từng mục tiêu</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Bắt đầu bằng tư vấn và lộ trình, sau đó nâng cấp sang mentor 1-1 khi bạn cần cam kết tiến
          độ và phản hồi sâu hơn.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan, index) => (
            <Card key={plan}>
              <CardHeader>
                <CardTitle>{plan}</CardTitle>
                <CardDescription>
                  {index === 4 ? 'Trao đổi với admin' : `Từ $${99 + index * 200}`}
                </CardDescription>
              </CardHeader>
              <Button variant={index === 2 ? 'primary' : 'outline'} className="w-full">
                Chọn gói
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
