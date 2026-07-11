import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { caseStudies, findCaseStudy } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return caseStudies.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = findCaseStudy(params.slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.description,
    keywords: item.keywords,
    alternates: { canonical: `/case-studies/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `/case-studies/${item.slug}`,
      images: [{ url: `/case-studies/${item.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default function CaseStudyPage({ params }: PageProps) {
  const item = findCaseStudy(params.slug);
  if (!item) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${siteUrl}/case-studies/${item.slug}#case-study`,
        headline: item.title,
        description: item.description,
        url: `${siteUrl}/case-studies/${item.slug}`,
        inLanguage: 'vi-VN',
        keywords: item.keywords.join(', '),
        author: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/case-studies/${item.slug}#faq`,
        mainEntity: item.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/case-studies/${item.slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MentorMind', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Case studies', item: `${siteUrl}/case-studies` },
          {
            '@type': 'ListItem',
            position: 3,
            name: item.title,
            item: `${siteUrl}/case-studies/${item.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <main className="home-page-background relative isolate overflow-hidden">
        <div className="home-page-ambient" aria-hidden="true" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Link href="/case-studies" className="text-sm font-semibold text-secondary hover:text-white">
            ← Tất cả case study
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                <ShieldCheck className="h-4 w-4" />
                Case study mẫu/mô phỏng
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {item.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{item.description}</p>
            </div>

            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Minh bạch nội dung</CardTitle>
                <CardDescription>{item.disclaimer}</CardDescription>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {item.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Persona</CardTitle>
                <CardDescription>{item.persona}</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vấn đề ban đầu</CardTitle>
                <CardDescription>{item.problem}</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <section className="mt-12 grid gap-5 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Các mốc học tập chính.</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {item.timeline.map((step) => (
                  <div key={step} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-200">
                    {step}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Approach</CardTitle>
                <CardDescription>Cách MentorMind xử lý vấn đề.</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {item.approach.map((step) => (
                  <div key={step} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <p className="text-sm leading-6 text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tín hiệu đo tiến bộ</CardTitle>
                <CardDescription>Không hứa kết quả, chỉ đo tín hiệu học thật.</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {item.signals.map((signal) => (
                  <div key={signal} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    <p className="text-sm leading-6 text-slate-200">{signal}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-semibold text-white">FAQ case study</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {item.faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription>{faq.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-secondary/20 bg-secondary/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-secondary">Muốn áp dụng cho hồ sơ của bạn?</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Tạo roadmap hoặc review CV ngay</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/create-roadmap">
                  <Button>
                    Tạo roadmap
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/cv-review">
                  <Button variant="outline">Review CV</Button>
                </Link>
              </div>
            </div>
          </section>
        </section>
      </main>
    </PageShell>
  );
}
