import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock, GraduationCap, Target } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seoCourses } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'Khóa học lập trình online theo mục tiêu đi làm',
  description:
    'Danh sách khóa học MentorMind: Frontend React, Backend NodeJS/NestJS, Fullstack Next.js/NestJS và AI Machine Learning ứng dụng.',
  keywords: ['khóa học lập trình online', 'khóa học frontend', 'khóa học backend', 'khóa học fullstack', 'khóa học AI online'],
  alternates: { canonical: '/khoa-hoc' },
  openGraph: {
    title: 'Khóa học lập trình online MentorMind',
    description:
      'Các khóa học có roadmap, mentor, AI, bài tập, portfolio, CV và mock interview.',
    url: '/khoa-hoc',
    images: [{ url: '/khoa-hoc/opengraph-image', width: 1200, height: 630 }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${siteUrl}/khoa-hoc#collection`,
      url: `${siteUrl}/khoa-hoc`,
      name: 'Khóa học lập trình online MentorMind',
      description: metadata.description,
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/khoa-hoc#courses`,
      itemListElement: seoCourses.map((course, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/khoa-hoc/${course.slug}`,
        name: course.title,
        description: course.description,
      })),
    },
  ],
};

export default function CoursesPage() {
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
              <GraduationCap className="h-4 w-4" />
              Trang khóa học thật
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Khóa học lập trình online theo mục tiêu đi làm
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              Mỗi khóa có audience, level, duration, module, outcome và FAQ riêng để người học chọn
              đúng hướng thay vì chỉ nhìn một bảng giá chung chung.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {seoCourses.map((course) => (
              <Link key={course.slug} href={`/khoa-hoc/${course.slug}`} className="group block h-full">
                <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-secondary/30">
                  <CardHeader>
                    <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.055] px-3 py-1">
                        <Target className="h-3.5 w-3.5" />
                        {course.level}
                      </span>
                    </div>
                    <CardTitle className="flex items-start justify-between gap-3 text-2xl">
                      <span>{course.title}</span>
                      <ArrowRight className="mt-1 h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {course.primaryKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
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
