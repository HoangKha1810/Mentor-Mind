import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock, GraduationCap, Target } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { findCourse, seoCourses } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return seoCourses.map((course) => ({ slug: course.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const course = findCourse(params.slug);
  if (!course) return {};

  return {
    title: `${course.title} | MentorMind`,
    description: course.description,
    keywords: course.primaryKeywords,
    alternates: { canonical: `/khoa-hoc/${course.slug}` },
    openGraph: {
      title: course.title,
      description: course.description,
      url: `/khoa-hoc/${course.slug}`,
      images: [{ url: `/khoa-hoc/${course.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default function CourseDetailPage({ params }: PageProps) {
  const course = findCourse(params.slug);
  if (!course) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        '@id': `${siteUrl}/khoa-hoc/${course.slug}#course`,
        name: course.title,
        description: course.description,
        url: `${siteUrl}/khoa-hoc/${course.slug}`,
        inLanguage: 'vi-VN',
        provider: { '@id': `${siteUrl}/#organization` },
        educationalLevel: course.level,
        teaches: course.outcomes,
        audience: {
          '@type': 'Audience',
          audienceType: course.audience,
        },
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: course.duration,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/khoa-hoc/${course.slug}#faq`,
        mainEntity: course.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/khoa-hoc/${course.slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MentorMind', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Khóa học', item: `${siteUrl}/khoa-hoc` },
          {
            '@type': 'ListItem',
            position: 3,
            name: course.title,
            item: `${siteUrl}/khoa-hoc/${course.slug}`,
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
          <Link href="/khoa-hoc" className="text-sm font-semibold text-secondary hover:text-white">
            ← Tất cả khóa học
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
                <GraduationCap className="h-4 w-4" />
                {course.level}
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">{course.description}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2">
                  <Clock className="h-4 w-4 text-secondary" />
                  {course.duration}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2">
                  <Target className="h-4 w-4 text-secondary" />
                  {course.audience}
                </span>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/create-roadmap">
                  <Button size="lg">
                    Tạo lộ trình học
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/packages">
                  <Button variant="outline" size="lg">
                    Xem gói học
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Outcome sau khóa học</CardTitle>
                <CardDescription>
                  Các kết quả này là mục tiêu học tập, không phải cam kết tuyển dụng.
                </CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {course.outcomes.map((outcome) => (
                  <div key={outcome} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <p className="text-sm leading-6 text-slate-200">{outcome}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <section className="mt-12">
            <h2 className="text-3xl font-semibold text-white">Nội dung khóa học</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {course.modules.map((module, index) => (
                <Card key={module.title}>
                  <CardHeader>
                    <p className="text-sm font-semibold text-secondary">Module {index + 1}</p>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-200">
                        {lesson}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-semibold text-white">FAQ khóa học</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {course.faqs.map((item) => (
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
