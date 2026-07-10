import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Building2,
  Code2,
  FileCheck2,
  Heart,
  MessagesSquare,
} from 'lucide-react';
import { HomeHero } from '@/components/home/home-hero';
import { PageShell } from '@/components/layout/page-shell';
import { PackageBrowser } from '@/components/packages/package-browser';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { publicFeatures } from '@/lib/public-content';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

export default function HomePage() {
  return (
    <PageShell>
      <div className="home-page-background relative isolate overflow-hidden">
        <div className="home-page-ambient" aria-hidden="true" />
        <HomeHero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ScrollReveal delay={0.2} direction="up">
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {publicFeatures.map((feature, index) => {
              const tone = featureTones[index % featureTones.length] ?? featureTones[0];
              return (
              <StaggerItem
                key={feature.title}
                className={index === 0 ? 'lg:col-span-2' : ''}
              >
                <Link href={feature.href} className="group block h-full">
                  <Card className="h-full min-h-[14rem]">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.panel}`} />
                    <div className="relative z-10 flex h-full flex-col">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${tone.icon}`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardHeader className="mb-0 mt-auto pt-8">
                        <CardTitle className="flex items-center justify-between gap-3">
                          {feature.title}
                          <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                        </CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
              );
            })}
          </StaggerContainer>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-secondary">Không gian học tập nhiều màu</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                Mọi bước học, cùng một nơi
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Mỗi khu vực gom đúng dữ liệu, tiến độ và hành động tiếp theo của tài khoản bạn.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                Xem dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid gap-4 lg:grid-cols-4">
          {showcaseTiles.map((tile, index) => (
            <StaggerItem key={tile.title} className={index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}>
              <Link href={tile.href} className="group block h-full">
                <div
                  className={`theme-on-color relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br ${tile.accent} p-5 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-white/25`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.24),transparent_34%,transparent_72%,rgba(255,255,255,0.08))]" />
                  <div className="absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/16 text-white shadow-soft">
                    <tile.icon className="h-8 w-8" />
                  </div>
                  <div className="relative z-10 mt-auto max-w-md">
                    <p className="text-xs font-semibold uppercase tracking-normal text-white/80">{tile.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">{tile.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/80">{tile.description}</p>
                  </div>
                  <div className="relative z-10 mt-5 overflow-hidden rounded-xl border border-white/14 bg-black/18 p-4">
                    {tile.preview}
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="process-band relative border-y border-white/8">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="text-sm font-semibold text-secondary">Quy trình 1-1</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Từ mục tiêu đến tiến độ đo được</h2>
          </ScrollReveal>
          <div className="mt-9 grid gap-7 md:grid-cols-3 lg:grid-cols-5">
            {learningSteps.map((step, index) => (
              <ScrollReveal key={step} delay={index * 0.08} direction="up">
                <div className="relative border-t border-white/14 pt-6">
                  <span
                    className={`theme-on-color inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-soft ${processTones[index] ?? processTones[0]}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-4 text-sm font-semibold leading-6 text-white">{step}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
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

      <section className="community-band">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
          <ScrollReveal direction="up">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white shadow-[0_18px_48px_rgba(239,68,68,0.24)]">
              <Heart className="h-9 w-9" />
            </div>
            <h2 className="mt-7 text-3xl font-semibold tracking-normal text-foreground">
              Xây dựng bằng tâm huyết cho học viên Việt Nam
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-mutedText">
              MentorMind giúp bạn biến mục tiêu nghề nghiệp thành lộ trình học rõ ràng, luyện code,
              hoàn thiện CV và chuẩn bị phỏng vấn trong một hệ thống có AI ghi nhớ ngữ cảnh học tập
              của từng tài khoản.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.15} direction="up">
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-8 text-mutedText/45 sm:grid-cols-3 lg:grid-cols-6">
              {companySignals.map((company) => (
                <div
                  key={company}
                  className="flex h-14 items-center justify-center text-lg font-semibold tracking-normal grayscale transition hover:text-mutedText"
                >
                  {company}
                </div>
              ))}
            </div>
          </ScrollReveal>

          <div className="community-divider mx-auto mt-16 h-px max-w-3xl" />

          <ScrollReveal delay={0.2} direction="up">
            <div className="mx-auto mt-14 max-w-3xl">
              <div className="community-chip inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-mutedText shadow-sm">
                <Building2 className="h-4 w-4 text-secondary" />
                Luyện theo tiêu chuẩn tuyển dụng thực tế
              </div>
              <p className="mt-6 text-base leading-8 text-mutedText">
                Không phải đối tác tuyển dụng. Đây là các nhóm công ty và sản phẩm công nghệ mà hệ
                thống dùng làm chuẩn tham chiếu để gợi ý bài luyện, CV keyword và câu hỏi phỏng vấn.
              </p>
              <Link
                href="/dashboard/cv-review"
                className="mt-8 inline-flex text-base font-semibold text-secondary transition hover:text-foreground"
              >
                Tải CV để AI cá nhân hóa lộ trình
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
      </div>
    </PageShell>
  );
}

const featureTones = [
  {
    panel: 'from-blue-500/28 via-cyan-500/12 to-transparent',
    icon: 'border-blue-300/30 bg-blue-500/18 text-blue-500',
  },
  {
    panel: 'from-violet-500/28 via-fuchsia-500/12 to-transparent',
    icon: 'border-violet-300/30 bg-violet-500/18 text-violet-500',
  },
  {
    panel: 'from-emerald-500/28 via-teal-500/12 to-transparent',
    icon: 'border-emerald-300/30 bg-emerald-500/18 text-emerald-500',
  },
  {
    panel: 'from-orange-500/28 via-rose-500/12 to-transparent',
    icon: 'border-orange-300/30 bg-orange-500/18 text-orange-500',
  },
] as const;

const learningSteps = [
  'Cho biết mục tiêu',
  'AI đề xuất kế hoạch',
  'Đội ngũ chuyên môn duyệt',
  'Bắt đầu học 1-1',
  'Luyện tập và theo dõi tiến độ',
];

const processTones = [
  'bg-gradient-to-br from-blue-500 to-cyan-500',
  'bg-gradient-to-br from-violet-500 to-fuchsia-500',
  'bg-gradient-to-br from-emerald-500 to-teal-500',
  'bg-gradient-to-br from-orange-500 to-rose-500',
  'bg-gradient-to-br from-indigo-500 to-blue-500',
];

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

const showcaseTiles = [
  {
    title: 'Code lab có test thật',
    eyebrow: 'Luyện code',
    href: '/code-practice',
    description: 'Danh sách 100 bài, bài đặc biệt, trạng thái accepted và editor gửi ngữ cảnh sang trợ lý AI.',
    icon: Code2,
    accent: 'from-blue-600 via-cyan-600 to-indigo-800',
    preview: (
      <div className="font-mono text-xs leading-6 text-cyan-50">
        <div className="mb-3 flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
        </div>
        <p>✓ test hidden: accepted</p>
        <p>✓ runtime: 42ms</p>
        <p>• premium unlock: 20.000đ</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[76%] rounded-full bg-cyan-200" />
        </div>
      </div>
    ),
  },
  {
    title: 'Mock phỏng vấn',
    eyebrow: 'Voice + AI score',
    href: '/ai-interview',
    description: 'Trả lời bằng text hoặc voice, nhận rubric và câu trả lời tốt hơn.',
    icon: MessagesSquare,
    accent: 'from-violet-600 via-fuchsia-600 to-blue-700',
    preview: (
      <div className="space-y-2 text-xs text-white">
        {['Câu hỏi 1', 'Voice input', 'Điểm 8/10'].map((item) => (
          <div key={item} className="rounded-lg bg-white/14 px-3 py-2">{item}</div>
        ))}
      </div>
    ),
  },
  {
    title: 'Kho tài nguyên',
    eyebrow: 'Tavily + nội bộ',
    href: '/resources',
    description: 'Tìm docs, bài viết, dự án theo mục tiêu và level.',
    icon: BookOpenCheck,
    accent: 'from-emerald-600 via-teal-600 to-cyan-700',
    preview: (
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-white">
        {['React', 'AI Agent', 'CV', 'Interview'].map((item) => (
          <span key={item} className="rounded-full bg-white/16 px-3 py-1">{item}</span>
        ))}
      </div>
    ),
  },
  {
    title: 'CV vượt ATS',
    eyebrow: 'Upload CV/JD',
    href: '/dashboard/cv-review',
    description: 'AI phân tích CV và lưu context cho trợ lý học tập.',
    icon: FileCheck2,
    accent: 'from-orange-500 via-rose-500 to-red-600',
    preview: (
      <div className="space-y-2 text-xs text-white">
        <div className="h-2 w-3/4 rounded-full bg-white/40" />
        <div className="h-2 w-11/12 rounded-full bg-white/28" />
        <div className="h-2 w-2/3 rounded-full bg-white/25" />
      </div>
    ),
  },
  {
    title: 'Trợ lý học tập',
    eyebrow: 'Context-aware',
    href: '/dashboard/ai-assistant',
    description: 'Ghi nhớ mục tiêu, lương, địa điểm và ngữ cảnh bài đang làm.',
    icon: Bot,
    accent: 'from-slate-700 via-blue-700 to-purple-700',
    preview: (
      <div className="rounded-lg bg-white/14 p-3 text-xs leading-5 text-white">
        “Mình sẽ gợi ý 3 bước tiếp theo dựa trên CV và bài code vừa làm.”
      </div>
    ),
  },
];
