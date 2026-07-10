import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Heart, Sparkles } from 'lucide-react';
import { LearningOrbit } from '@/components/home/learning-orbit';
import { PageShell } from '@/components/layout/page-shell';
import { PackageBrowser } from '@/components/packages/package-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { publicFeatures } from '@/lib/public-content';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { GlowingCard } from '@/components/ui/glowing-card';
import { Particles } from '@/components/ui/particles';
export default function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <Particles count={50} />
        <div className="grid-fade absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:pb-20">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit text-secondary">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Nền tảng học 1-1 có AI và mentor đồng hành
            </Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-tight tracking-normal text-white md:text-6xl">
              Học 1-1 cá nhân hóa bằng AI và mentor.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              MentorMind giúp học viên đi từ mục tiêu nghề nghiệp đến kế hoạch học, buổi học 1-1,
              luyện code, phỏng vấn và cải thiện CV trong một hệ thống vận hành thống nhất.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-roadmap">
                <Button size="lg">
                  Tạo lộ trình của tôi
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/packages">
                <Button variant="outline" size="lg">
                  Xem gói học 1-1
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {['Có người duyệt lộ trình', 'Mentor theo sát', 'AI hỗ trợ đúng lúc'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <LearningOrbit />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ScrollReveal delay={0.2} direction="up">
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {publicFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <GlowingCard className="h-full">
                  <Card className="border-0 bg-transparent shadow-none">
                    <feature.icon className="h-6 w-6 text-secondary" />
                    <CardHeader className="mb-0 mt-4 px-0 pb-0">
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </GlowingCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </ScrollReveal>
      </section>

      <section className="border-y border-white/8 bg-surface/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.05),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
          {[
            'Cho biết mục tiêu',
            'AI đề xuất kế hoạch',
            'Đội ngũ chuyên môn duyệt',
            'Bắt đầu học 1-1',
            'Luyện tập và theo dõi tiến độ',
          ].map((step, index) => (
            <ScrollReveal key={step} delay={index * 0.1} direction="up">
              <GlowingCard className="h-full p-5">
                <div className="text-sm font-semibold text-secondary">0{index + 1}</div>
                <div className="mt-3 text-base font-medium text-white">{step}</div>
              </GlowingCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal direction="none">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-secondary">Gói học nổi bật</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Lộ trình 1-1 cho mục tiêu học thật
              </h2>
            </div>
            <Link
              href="/packages"
              className="hidden text-sm text-secondary md:block hover:text-white transition-colors"
            >
              Xem tất cả gói học &rarr;
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2} direction="up">
          <PackageBrowser compact />
        </ScrollReveal>
      </section>

      <section className="bg-[#f8fafc] text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <ScrollReveal direction="up">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white shadow-[0_18px_48px_rgba(239,68,68,0.24)]">
              <Heart className="h-9 w-9" />
            </div>
            <h2 className="mt-7 text-3xl font-semibold tracking-normal text-slate-950">
              Xây dựng bằng tâm huyết cho học viên Việt Nam
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-500">
              MentorMind giúp bạn biến mục tiêu nghề nghiệp thành lộ trình học rõ ràng, luyện code,
              hoàn thiện CV và chuẩn bị phỏng vấn trong một hệ thống có AI ghi nhớ ngữ cảnh học tập
              của từng tài khoản.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15} direction="up">
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-8 text-slate-300 sm:grid-cols-3 lg:grid-cols-6">
              {companySignals.map((company) => (
                <div
                  key={company}
                  className="flex h-14 items-center justify-center text-lg font-semibold tracking-normal grayscale transition hover:text-slate-500"
                >
                  {company}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="mx-auto mt-16 h-px max-w-3xl bg-slate-200" />

          <ScrollReveal delay={0.2} direction="up">
            <div className="mx-auto mt-14 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                <Building2 className="h-4 w-4 text-secondary" />
                Luyện theo tiêu chuẩn tuyển dụng thực tế
              </div>
              <p className="mt-6 text-base leading-8 text-slate-500">
                Không phải đối tác tuyển dụng. Đây là các nhóm công ty và sản phẩm công nghệ mà hệ
                thống dùng làm chuẩn tham chiếu để gợi ý bài luyện, CV keyword và câu hỏi phỏng vấn.
              </p>
              <Link
                href="/dashboard/cv-review"
                className="mt-8 inline-flex text-base font-semibold text-secondary transition hover:text-slate-900"
              >
                Tải CV để AI cá nhân hóa lộ trình
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageShell>
  );
}

const companySignals = [
  'Meta',
  'Google',
  'Apple',
  'Uber',
  'Shopee',
  'Amazon',
  'TikTok',
  'Cisco',
  'Stripe',
  'Grab',
  'Intel',
  'Pinterest',
];
