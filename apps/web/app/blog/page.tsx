import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Clock, Newspaper, SearchCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blogArticles } from '@/lib/seo-growth-content';
import { siteUrl } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: 'Blog học lập trình, AI, CV và phỏng vấn IT',
  description:
    'Blog MentorMind chia sẻ lộ trình học lập trình, frontend, backend, ReactJS, NodeJS, AI Machine Learning, CV ATS, portfolio và luyện phỏng vấn IT.',
  keywords: [
    'blog học lập trình',
    'lộ trình học lập trình',
    'học frontend online',
    'học backend online',
    'sửa CV ATS IT',
    'luyện phỏng vấn IT',
  ],
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog học lập trình MentorMind',
    description: 'Roadmap, hướng dẫn học, CV, phỏng vấn và deploy cho người học lập trình đi làm.',
    url: '/blog',
    images: [{ url: '/blog/opengraph-image', width: 1200, height: 630 }],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      '@id': `${siteUrl}/blog#blog`,
      url: `${siteUrl}/blog`,
      name: 'Blog học lập trình MentorMind',
      description: metadata.description,
      inLanguage: 'vi-VN',
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/blog#articles`,
      itemListElement: blogArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/blog/${article.slug}`,
        name: article.title,
        description: article.description,
      })),
    },
  ],
};

export default function BlogPage() {
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
              <Newspaper className="h-4 w-4" />
              Blog & tài nguyên SEO
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Blog học lập trình, AI, CV và phỏng vấn IT
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              Các bài viết được xây theo cụm keyword thật: người mới học lập trình, frontend,
              ReactJS, backend NodeJS, AI/ML, CV ATS, phỏng vấn và deploy production.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {blogArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block h-full"
              >
                <Card interactive reveal className="h-full group-hover:border-secondary/30">
                  <CardHeader>
                    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
                      <span className="rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-secondary">
                        {article.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {article.readMinutes} phút đọc
                      </span>
                    </div>
                    <CardTitle className="flex items-start justify-between gap-3 text-xl">
                      <span>{article.title}</span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                    </CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                    <div className="pt-3 text-xs font-semibold text-secondary">
                      <SearchCheck className="mr-1 inline h-3.5 w-3.5" />
                      {article.keyword}
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
