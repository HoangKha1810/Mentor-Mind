import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { LearningOrbit } from '@/components/home/learning-orbit';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { packages, publicFeatures } from '@/lib/mock-data';

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="grid-fade absolute inset-0" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit text-secondary">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Mentor-reviewed AI learning plans
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
              Personalized 1-on-1 learning powered by AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Create a custom learning roadmap, get mentor consultation, practice interviews, solve
              coding challenges, and become job-ready with AI-assisted tutoring.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-roadmap">
                <Button size="lg">
                  Create my roadmap
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/packages">
                <Button variant="outline" size="lg">
                  Explore tutoring packages
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {['Admin-reviewed', 'Mentor-led', 'Mock-AI ready'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <LearningOrbit />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {publicFeatures.map((feature) => (
            <Card key={feature.title}>
              <feature.icon className="h-6 w-6 text-secondary" />
              <CardHeader className="mb-0 mt-4">
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-surface/50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
          {['Tell us your goal', 'AI drafts your roadmap', 'Admin/mentor reviews it', 'Start 1-on-1 learning', 'Practice and track progress'].map(
            (step, index) => (
              <div key={step} className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
                <div className="text-sm font-semibold text-secondary">0{index + 1}</div>
                <div className="mt-3 text-base font-medium text-white">{step}</div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-secondary">Featured Packages</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">1-on-1 paths, not passive courses</h2>
          </div>
          <Link href="/packages" className="hidden text-sm text-secondary md:block">
            View all packages
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((pack) => (
            <Card key={pack.slug}>
              <Badge>{pack.level.replace('_', ' ')}</Badge>
              <CardHeader className="mt-4">
                <CardTitle>{pack.title}</CardTitle>
                <CardDescription>{pack.shortDescription}</CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-white">{formatCurrency(pack.price, pack.currency)}</span>
                <Link href={`/packages/${pack.slug}`}>
                  <Button variant="secondary" size="sm">
                    Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
