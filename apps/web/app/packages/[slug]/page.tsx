import Link from 'next/link';
import { CalendarCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { packages } from '@/lib/mock-data';

export default function PackageDetailPage({ params }: { params: { slug: string } }) {
  const pack = packages.find((item) => item.slug === params.slug) ?? packages[0]!;

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
        <div>
          <Badge>{pack.category}</Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white">{pack.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{pack.shortDescription}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {['Weekly outcomes', 'Mentor review', 'AI interview practice', 'Coding feedback'].map((item) => (
              <Card key={item} className="p-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="mt-3 font-medium text-white">{item}</div>
                <p className="mt-1 text-sm text-mutedText">Built into this 1-on-1 tutoring journey.</p>
              </Card>
            ))}
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Included AI tools</CardTitle>
              <CardDescription>Designed to support mentor-led progress, not replace the mentor.</CardDescription>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {pack.includedAiTools.map((tool) => (
                <Badge key={tool}>{tool}</Badge>
              ))}
            </div>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{formatCurrency(pack.price, pack.currency)}</CardTitle>
            <CardDescription>
              {pack.recommendedSessions} sessions over {pack.durationWeeks} weeks for {pack.targetRole}.
            </CardDescription>
          </CardHeader>
          <Button className="w-full">
            <CalendarCheck className="h-4 w-4" />
            Request consultation
          </Button>
          <Link href="/create-roadmap">
            <Button variant="outline" className="mt-3 w-full">
              Create custom roadmap
            </Button>
          </Link>
        </Card>
      </section>
    </PageShell>
  );
}
