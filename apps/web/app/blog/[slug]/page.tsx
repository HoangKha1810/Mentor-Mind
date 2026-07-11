import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, CheckCircle2, Clock, SearchCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blogArticles, findArticle } from '@/lib/seo-growth-content';
import { seoLandingPages, siteUrl } from '@/lib/seo-content';

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const article = findArticle(params.slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    keywords: [article.keyword, ...article.related],
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      url: `/blog/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: [{ url: `/blog/${article.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
  };
}

export default function BlogArticlePage({ params }: PageProps) {
  const article = findArticle(params.slug);
  if (!article) notFound();

  const relatedPages = seoLandingPages.filter((page) => article.related.includes(page.slug));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${siteUrl}/blog/${article.slug}#article`,
        headline: article.title,
        description: article.description,
        url: `${siteUrl}/blog/${article.slug}`,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: 'vi-VN',
        keywords: [article.keyword, ...article.related].join(', '),
        author: { '@id': `${siteUrl}/#organization` },
        publisher: { '@id': `${siteUrl}/#organization` },
        mainEntityOfPage: `${siteUrl}/blog/${article.slug}`,
      },
      {
        '@type': 'FAQPage',
        '@id': `${siteUrl}/blog/${article.slug}#faq`,
        mainEntity: article.faqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${siteUrl}/blog/${article.slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MentorMind', item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: `${siteUrl}/blog/${article.slug}`,
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

        <article className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/blog" className="text-sm font-semibold text-secondary hover:text-white">
              ← Blog MentorMind
            </Link>
          </div>

          <header>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 font-semibold text-secondary">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {article.updatedAt}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readMinutes} phút đọc
              </span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              {article.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm font-semibold text-slate-200">
              <SearchCheck className="h-4 w-4 text-secondary" />
              Keyword chính: {article.keyword}
            </div>
          </header>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle>Ý chính cần nhớ</CardTitle>
              <CardDescription>
                Đọc nhanh nếu bạn muốn nắm lộ trình trước, sau đó đi vào từng phần chi tiết.
              </CardDescription>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-3">
              {article.takeaways.map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-success" />
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-10 space-y-8">
            {article.sections.map((section) => (
              <section key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="text-2xl font-semibold text-white">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-slate-300">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10">
            <h2 className="text-3xl font-semibold text-white">FAQ</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {article.faqs.map((item) => (
                <Card key={item.question}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                    <CardDescription>{item.answer}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-secondary/20 bg-secondary/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-secondary">Muốn biến bài này thành kế hoạch học?</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Tạo roadmap theo mục tiêu của bạn</h2>
              </div>
              <Link href="/create-roadmap">
                <Button>
                  Tạo lộ trình
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </section>

          {relatedPages.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-white">Trang liên quan</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedPages.map((page) => (
                  <Link key={page.slug} href={`/${page.slug}`} className="group block h-full">
                    <Card className="h-full transition group-hover:border-secondary/30">
                      <CardHeader>
                        <p className="text-xs font-semibold uppercase tracking-normal text-secondary">
                          {page.eyebrow}
                        </p>
                        <CardTitle className="text-lg">{page.title}</CardTitle>
                        <CardDescription>{page.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </main>
    </PageShell>
  );
}
