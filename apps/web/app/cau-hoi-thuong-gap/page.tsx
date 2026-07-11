import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { faqGroups } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp về học lập trình online, mentor, CV và AI',
  description:
    'FAQ MentorMind: học lập trình online, mentor 1-1, gói học, luyện code, phỏng vấn AI, sửa CV ATS, tài khoản, dashboard và admin.',
  keywords: [
    'câu hỏi thường gặp học lập trình',
    'FAQ học lập trình online',
    'mentor lập trình 1-1',
    'luyện phỏng vấn AI',
    'sửa CV ATS IT',
  ],
  alternates: { canonical: '/cau-hoi-thuong-gap' },
  openGraph: {
    title: 'FAQ MentorMind',
    description: 'Câu hỏi thường gặp về học lập trình online, mentor, CV, phỏng vấn và AI.',
    url: '/cau-hoi-thuong-gap',
    images: [{ url: '/cau-hoi-thuong-gap/opengraph-image', width: 1200, height: 630 }],
  },
};

const allFaqs = faqGroups.flatMap((group) => group.items);
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/cau-hoi-thuong-gap#faq`,
      url: `${siteUrl}/cau-hoi-thuong-gap`,
      name: 'Câu hỏi thường gặp MentorMind',
      inLanguage: 'vi-VN',
      mainEntity: allFaqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/cau-hoi-thuong-gap#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'MentorMind', item: siteUrl },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Câu hỏi thường gặp',
          item: `${siteUrl}/cau-hoi-thuong-gap`,
        },
      ],
    },
  ],
};

export default function FaqPage() {
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
              <HelpCircle className="h-4 w-4" />
              FAQ thật
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Câu hỏi thường gặp về học lập trình online, mentor, CV và AI
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              Trang FAQ giúp người học giải đáp nhanh các thắc mắc trước khi tạo roadmap, chọn gói
              mentor 1-1, luyện code, mock interview hoặc review CV ATS.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {faqGroups.map((group) => (
              <section key={group.title}>
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-white">{group.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{group.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {group.items.map((item) => (
                    <Card key={item.question}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                        <CardDescription>{item.answer}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-secondary/20 bg-secondary/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-secondary">Chưa thấy câu hỏi của bạn?</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Tạo roadmap để hệ thống tư vấn theo mục tiêu riêng
                </h2>
              </div>
              <Link href="/create-roadmap">
                <Button>
                  Tạo roadmap
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>
        </section>
      </main>
    </PageShell>
  );
}
