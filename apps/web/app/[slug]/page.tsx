import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, SearchCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seoLandingPages, siteUrl } from '@/lib/seo-content';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = findPage(params.slug);
  if (!page) return {};

  return {
    title: `${page.title} | MentorMind`,
    description: page.description,
    keywords: [...page.keywords],
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${page.slug}`,
      siteName: 'MentorMind',
      type: 'website',
      locale: 'vi_VN',
    },
  };
}

export default function SeoLandingPage({ params }: PageProps) {
  const page = findPage(params.slug);
  if (!page) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${siteUrl}/${page.slug}#webpage`,
        url: `${siteUrl}/${page.slug}`,
        name: page.title,
        description: page.description,
        inLanguage: 'vi-VN',
        keywords: page.keywords.join(', '),
      },
      {
        '@type': 'Service',
        '@id': `${siteUrl}/${page.slug}#service`,
        name: page.title,
        description: page.description,
        provider: { '@id': `${siteUrl}/#organization` },
        areaServed: 'Vietnam',
        serviceType: page.eyebrow,
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/${page.slug}#faq`,
        mainEntity: page.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                <SearchCheck className="h-4 w-4" />
                {page.eyebrow}
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {page.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={page.primaryHref}>
                  <Button size="lg">
                    {page.primaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button type="button" variant="outline" size="lg">
                    Xem gói học
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Từ khóa liên quan</CardTitle>
                <CardDescription>
                  Trang này được tối ưu theo đúng cụm ý định tìm kiếm, không nhồi keyword.
                </CardDescription>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {page.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {page.sections.map((section) => (
              <Card key={section}>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <CardHeader className="mb-0 mt-4">
                  <CardTitle className="text-base">{section}</CardTitle>
                  <CardDescription>
                    Kết hợp dữ liệu tài khoản, mentor và AI để biến mục tiêu thành bước học cụ thể.
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <section className="mt-12">
            <div className="mb-5">
              <p className="text-sm font-semibold text-secondary">FAQ</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Câu hỏi thường gặp</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {page.faq.map((item) => (
                <Card key={item.question}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    <CardDescription>{item.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </section>
      </main>
    </PageShell>
  );
}

function findPage(slug: string) {
  return seoLandingPages.find((page) => page.slug === slug);
}
