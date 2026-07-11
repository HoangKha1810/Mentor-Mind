import Link from 'next/link';
import { ArrowRight, SearchCheck } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seoLandingPages } from '@/lib/seo-content';

type SeoTopicLinksProps = {
  currentSlug?: string;
  limit?: number;
};

export function SeoTopicLinks({ currentSlug, limit }: SeoTopicLinksProps) {
  const pages = seoLandingPages
    .filter((page) => page.slug !== currentSlug)
    .slice(0, limit ?? seoLandingPages.length);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 max-w-3xl">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-secondary">
          <SearchCheck className="h-4 w-4" />
          Chủ đề học tập được tìm nhiều
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Chọn đúng lộ trình theo mục tiêu của bạn
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          MentorMind tách từng nhu cầu học thành trang riêng để bạn tìm nhanh đúng hướng: frontend,
          backend, fullstack, AI, data, luyện phỏng vấn, CV và portfolio.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.slug} href={`/${page.slug}`} className="group block h-full">
            <Card className="h-full transition duration-300 group-hover:-translate-y-1 group-hover:border-secondary/30">
              <CardHeader>
                <p className="text-xs font-semibold uppercase tracking-normal text-secondary">
                  {page.eyebrow}
                </p>
                <CardTitle className="flex items-start justify-between gap-3 text-lg">
                  <span>{page.title}</span>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                </CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
