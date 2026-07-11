import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CopyCheck, Link2 } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteUrl } from '@/lib/seo-content';

export const metadata: Metadata = {
  title: { absolute: 'Media kit MentorMind cho báo chí, đối tác và backlink' },
  description:
    'Media kit MentorMind: mô tả ngắn, anchor text gợi ý, trang đích SEO và nội dung trích dẫn cho đối tác, blog giáo dục và cộng đồng IT.',
  keywords: [
    'MentorMind media kit',
    'backlink học lập trình',
    'đối tác giáo dục IT',
    'học lập trình online MentorMind',
  ],
  alternates: { canonical: '/media-kit' },
  openGraph: {
    title: 'Media kit MentorMind',
    description: 'Thông tin trích dẫn, anchor text và landing pages cho đối tác/blog/cộng đồng IT.',
    url: '/media-kit',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

const backlinkTargets = [
  {
    anchor: 'học lập trình online có mentor',
    url: `${siteUrl}/hoc-lap-trinh-online`,
    note: 'Dùng cho bài viết giới thiệu lộ trình học lập trình cho người mới.',
  },
  {
    anchor: 'mentor lập trình 1-1',
    url: `${siteUrl}/mentor-lap-trinh-1-1`,
    note: 'Dùng cho bài viết so sánh tự học và học có mentor.',
  },
  {
    anchor: 'khóa học frontend React',
    url: `${siteUrl}/khoa-hoc/frontend-react-di-lam`,
    note: 'Dùng cho nội dung frontend, ReactJS, portfolio.',
  },
  {
    anchor: 'học NodeJS backend',
    url: `${siteUrl}/hoc-nodejs-backend`,
    note: 'Dùng cho nội dung backend, NestJS, Prisma, deploy VPS.',
  },
  {
    anchor: 'sửa CV ATS IT',
    url: `${siteUrl}/sua-cv-ats-it`,
    note: 'Dùng cho bài viết CV, portfolio và chuẩn bị ứng tuyển IT.',
  },
];

const descriptions = [
  'MentorMind là nền tảng học lập trình online cá nhân hóa, kết hợp roadmap AI, mentor 1-1, luyện code, phỏng vấn AI, review CV ATS và tài nguyên học tập theo mục tiêu đi làm.',
  'MentorMind giúp người học biến mục tiêu frontend, backend, fullstack, data hoặc AI thành lộ trình có checkpoint, bài tập, portfolio, CV và mock interview.',
];

const outreachIdeas = [
  'Bài guest post: “Lộ trình học lập trình cho người mới trong 12 tuần đầu”.',
  'Bài so sánh: “Tự học lập trình vs học có mentor 1-1”.',
  'Checklist tải về: “CV ATS cho fresher IT”.',
  'Case study mẫu: “Từ dự án portfolio đến phỏng vấn frontend”.',
  'Tài nguyên cộng đồng: roadmap frontend/backend/data/AI miễn phí.',
];

export default function MediaKitPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${siteUrl}/media-kit#page`,
        url: `${siteUrl}/media-kit`,
        name: 'Media kit MentorMind',
        description: metadata.description,
        inLanguage: 'vi-VN',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
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
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary">
              <Link2 className="h-4 w-4" />
              Media kit & backlink kit
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Media kit MentorMind cho báo chí, đối tác và backlink
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
              Dùng trang này khi liên hệ blog giáo dục, cộng đồng IT, trường/lớp học, fanpage nghề
              nghiệp hoặc đối tác muốn trích dẫn MentorMind.
            </p>
          </div>

          <section className="mt-10 grid gap-5 lg:grid-cols-2">
            {descriptions.map((description, index) => (
              <Card key={description}>
                <CardHeader>
                  <p className="text-sm font-semibold text-secondary">Mô tả ngắn {index + 1}</p>
                  <CardTitle className="flex items-center gap-2">
                    <CopyCheck className="h-5 w-5 text-success" />
                    Có thể copy để giới thiệu
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="mt-12">
            <h2 className="text-3xl font-semibold text-white">Anchor text và URL nên dùng</h2>
            <div className="mt-5 grid gap-4">
              {backlinkTargets.map((target) => (
                <Card key={target.url}>
                  <CardHeader>
                    <CardTitle className="text-lg">{target.anchor}</CardTitle>
                    <CardDescription>
                      <span className="block text-secondary">{target.url}</span>
                      <span className="mt-2 block">{target.note}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Ý tưởng nội dung để xin backlink</CardTitle>
                <CardDescription>
                  Backlink tốt thường đến từ nội dung hữu ích, không phải spam link hàng loạt.
                </CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {outreachIdeas.map((idea) => (
                  <div
                    key={idea}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-200"
                  >
                    {idea}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Trang đích nên ưu tiên</CardTitle>
                <CardDescription>
                  Nếu đối tác chỉ cho đặt một link, ưu tiên trang khớp nhất với nội dung bài viết.
                </CardDescription>
              </CardHeader>
              <div className="flex flex-wrap gap-3">
                <Link href="/blog">
                  <Button variant="outline">Blog</Button>
                </Link>
                <Link href="/khoa-hoc">
                  <Button variant="outline">Khóa học</Button>
                </Link>
                <Link href="/case-studies">
                  <Button variant="outline">Case studies</Button>
                </Link>
                <Link href="/cau-hoi-thuong-gap">
                  <Button>
                    FAQ
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </section>
        </section>
      </main>
    </PageShell>
  );
}
