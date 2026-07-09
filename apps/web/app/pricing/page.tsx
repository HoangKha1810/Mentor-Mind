import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const plans = ['Starter Consultation', 'AI Roadmap', '1-on-1 Mentor Plan', 'Job-ready Bootcamp', 'Custom Plan'];

export default function PricingPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-white">Pricing that follows the learning journey</h1>
        <p className="mt-3 max-w-2xl text-slate-300">Start with AI guidance, then move into mentor-reviewed 1-on-1 plans when you are ready.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan, index) => (
            <Card key={plan}>
              <CardHeader>
                <CardTitle>{plan}</CardTitle>
                <CardDescription>{index === 4 ? 'Talk to admin' : `$${99 + index * 200} starting`}</CardDescription>
              </CardHeader>
              <Button variant={index === 2 ? 'primary' : 'outline'} className="w-full">
                Select
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
