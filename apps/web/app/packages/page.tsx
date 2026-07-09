import Link from 'next/link';
import { Search } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { packages } from '@/lib/mock-data';

export default function PackagesPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-medium text-secondary">Tutoring Packages</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Ready-made 1-on-1 learning paths</h1>
          <p className="mt-3 text-slate-300">Filter mentor-led packages by role, level and AI tools, or create a custom roadmap.</p>
        </div>
        <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-mutedText" />
            <Input className="pl-9" placeholder="Search frontend, backend, AI, interview..." />
          </div>
          <Button variant="outline">Frontend</Button>
          <Button variant="outline">Backend</Button>
          <Button variant="outline">Career</Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((pack) => (
            <Card key={pack.slug}>
              <div className="flex items-center justify-between">
                <Badge>{pack.category}</Badge>
                <span className="text-sm text-mutedText">{pack.durationWeeks} weeks</span>
              </div>
              <CardHeader className="mt-4">
                <CardTitle>{pack.title}</CardTitle>
                <CardDescription>{pack.shortDescription}</CardDescription>
              </CardHeader>
              <div className="mb-5 flex flex-wrap gap-2">
                {pack.skills.slice(0, 4).map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">{formatCurrency(pack.price, pack.currency)}</span>
                <Link href={`/packages/${pack.slug}`}>
                  <Button>View Details</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
