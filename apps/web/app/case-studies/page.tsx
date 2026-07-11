import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BarChart3, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { caseStudies } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'Case study học lập trình, CV và phỏng vấn IT',
  description:
    'Case study mẫu của MentorMind: học frontend, backend production, sửa CV ATS, portfolio, mock interview và roadmap theo mục tiêu.',
  keywords: [
    'case study học lập trình',
    'case study frontend',
    'case study backend',
    'case study sửa CV ATS',
  ],
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Case study học lập trình MentorMind',
    description: 'Các kịch bản học tập có roadmap, approach, tín hiệu đo tiến bộ và FAQ.',
    url: '/case-studies',
    images: [{ url: '/case-studies/opengraph-image', width: 1200, height: 630 }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/case-studies#collection`,
      url: `${siteUrl}/case-studies`,
      name: 'Case study học lập trình MentorMind',
      description: metadata.description,
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/case-studies#cases`,
      itemListElement: caseStudies.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/case-studies/${item.slug}`,
        name: item.title,
        description: item.description,
      })),
    },
  ],
};

export default function CaseStudiesPage() {
  return (
    <PageShell>
      <main className="home-page-background relative isolate overflow-hidden">
        <div className="home-page-ambient" aria-hidden="true" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
              <BarChart3 className="h-4 w-4" />
              Case study mẫu
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Case study học lập trình, CV và phỏng vấn IT
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              Đây là các case study mẫu/mô phỏng theo tình huống học viên thường gặp. Nội dung giúp
              người đọc hình dung quy trình học, đồng thời tạo asset tốt cho SEO và backlink.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {caseStudies.map((item) => (
              <Link
                key={item.slug}
                href={`/case-studies/${item.slug}`}
                className="group block h-full"
              >
                <Card interactive reveal className="h-full group-hover:border-secondary/30">
                  <CardHeader>
                    <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Mô phỏng minh bạch
                    </div>
                    <CardTitle className="flex items-start justify-between gap-3 text-xl">
                      <span>{item.title}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PageShell>
  );
}
