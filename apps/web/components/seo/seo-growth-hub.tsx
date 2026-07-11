import Link from 'next/link';
import { ArrowRight, BarChart3, GraduationCap, HelpCircle, Link2, Newspaper } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { blogArticles, caseStudies, seoCourses } from '@/lib/seo-growth-content';

export function SeoGrowthHub() {
  const hubs = [
    {
      href: '/blog',
      eyebrow: `${blogArticles.length} bài`,
      title: 'Blog học lập trình',
      description: 'Roadmap, frontend, backend, React, NodeJS, CV, phỏng vấn và deploy.',
      icon: Newspaper,
      accent: 'from-cyan-500/18 to-blue-500/8',
    },
    {
      href: '/khoa-hoc',
      eyebrow: `${seoCourses.length} khóa`,
      title: 'Trang khóa học thật',
      description: 'Trang SEO chi tiết cho frontend, backend, fullstack và AI/ML.',
      icon: GraduationCap,
      accent: 'from-violet-500/18 to-fuchsia-500/8',
    },
    {
      href: '/case-studies',
      eyebrow: `${caseStudies.length} case`,
      title: 'Case study mẫu',
      description: 'Kịch bản học tập, tín hiệu đo tiến độ và nội dung dễ được trích dẫn.',
      icon: BarChart3,
      accent: 'from-emerald-500/18 to-cyan-500/8',
    },
    {
      href: '/cau-hoi-thuong-gap',
      eyebrow: 'FAQ schema',
      title: 'Câu hỏi thường gặp',
      description: 'FAQ thật theo nhu cầu học, mentor, CV, phỏng vấn và tài khoản.',
      icon: HelpCircle,
      accent: 'from-orange-500/18 to-rose-500/8',
    },
    {
      href: '/media-kit',
      eyebrow: 'Backlink kit',
      title: 'Media kit',
      description: 'Anchor text, URL trọng điểm và mô tả ngắn để gửi đối tác/cộng đồng.',
      icon: Link2,
      accent: 'from-blue-500/18 to-cyan-500/8',
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-7 max-w-3xl">
        <p className="text-sm font-semibold text-secondary">SEO content engine</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">
          Nội dung đều để kéo traffic tự nhiên
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Những cụm này tạo nền cho Google hiểu MentorMind không chỉ là app, mà là một hệ sinh thái
          học lập trình có roadmap, khóa học, case study và tài nguyên hữu ích.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {hubs.map((hub) => (
          <Link key={hub.href} href={hub.href} className="group block h-full">
            <Card interactive reveal className="h-full group-hover:border-secondary/30">
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${hub.accent}`}
              />
              <CardHeader className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-secondary">
                  <hub.icon className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-normal text-secondary">
                  {hub.eyebrow}
                </p>
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                  {hub.title}
                  <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                </CardTitle>
                <CardDescription>{hub.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
