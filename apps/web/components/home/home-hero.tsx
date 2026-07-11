'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Code2,
  FileCheck2,
  Mic2,
  Pause,
  Play,
  Route,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const slides = [
  {
    image: '/hero/learning-together.webp',
    alt: 'Nhóm học viên cùng trao đổi bên máy tính',
    eyebrow: 'Lộ trình rõ ràng',
    headline: 'Từ mục tiêu nghề nghiệp đến từng tuần học cụ thể.',
    description:
      'AI phác thảo kế hoạch theo level và thời gian rảnh, sau đó đội ngũ chuyên môn duyệt lại trước khi bạn bắt đầu.',
    overlay:
      'bg-[linear-gradient(90deg,rgba(5,16,38,0.98)_0%,rgba(17,57,112,0.90)_48%,rgba(37,99,235,0.34)_100%)]',
    accent: 'bg-cyan-300',
    metric: '1:1',
    metricLabel: 'mentor đồng hành',
    visualIcon: Route,
    visualTitle: 'Roadmap AI',
    visualSubtitle: 'Level scan → kế hoạch tuần → mentor duyệt',
    visualRows: [
      'Mục tiêu: Frontend đi làm',
      '12 tuần học có checkpoint',
      'Gợi ý tài nguyên theo level',
    ],
    visualProgress: 84,
    visualTone: 'from-blue-500 via-cyan-500 to-indigo-600',
    visualGlow: 'bg-cyan-400/30',
    visualChips: ['AI', 'Mentor', 'Roadmap'],
  },
  {
    image: '/hero/code-review.webp',
    alt: 'Hai người cùng review nội dung trên laptop',
    eyebrow: 'Luyện tập có phản hồi',
    headline: 'Code, phỏng vấn và CV nằm trong cùng một nhịp học.',
    description:
      'Bài làm, rubric phỏng vấn và phân tích CV được lưu theo tài khoản để AI hỗ trợ đúng phần bạn đang vướng.',
    overlay:
      'bg-[linear-gradient(90deg,rgba(28,12,55,0.98)_0%,rgba(88,28,135,0.88)_47%,rgba(219,39,119,0.32)_100%)]',
    accent: 'bg-fuchsia-300',
    metric: '24/7',
    metricLabel: 'AI giữ ngữ cảnh',
    visualIcon: Code2,
    visualTitle: 'Code review lab',
    visualSubtitle: 'Judge0 + AI context + bài tập đặc biệt',
    visualRows: ['Hidden tests: accepted', 'Runtime: 42ms', 'AI gợi ý đúng lỗi hiện tại'],
    visualProgress: 76,
    visualTone: 'from-violet-500 via-fuchsia-500 to-blue-600',
    visualGlow: 'bg-fuchsia-400/30',
    visualChips: ['Code', 'Test', 'AI Hint'],
  },
  {
    image: '/hero/mentor-session.webp',
    alt: 'Mentor hướng dẫn học viên trong buổi học công nghệ',
    eyebrow: 'Mentor thật, dữ liệu thật',
    headline: 'Mỗi buổi học đều nối tiếp đúng tiến độ của bạn.',
    description:
      'Lịch học, bài tập, ghi chú và bước tiếp theo được gom về một dashboard để cả học viên và mentor cùng theo dõi.',
    overlay:
      'bg-[linear-gradient(90deg,rgba(4,35,34,0.98)_0%,rgba(5,101,89,0.88)_48%,rgba(249,115,22,0.34)_100%)]',
    accent: 'bg-emerald-300',
    metric: '100%',
    metricLabel: 'theo tài khoản',
    visualIcon: BookOpenCheck,
    visualTitle: 'Mentor session',
    visualSubtitle: 'Lịch học, note, bài tập và tiến độ cùng một luồng',
    visualRows: ['Buổi 06: React patterns', 'Homework đã giao', 'Next step: CV keyword'],
    visualProgress: 68,
    visualTone: 'from-emerald-500 via-teal-500 to-cyan-600',
    visualGlow: 'bg-emerald-400/30',
    visualChips: ['Live', 'Homework', 'Progress'],
  },
  {
    image: '/hero/ai-roadmap-lab.webp',
    alt: 'Giao diện minh họa lộ trình AI với nhiều thẻ màu',
    eyebrow: 'Dashboard nhiều màu',
    headline: 'Một workspace sáng rõ cho mọi phần học quan trọng.',
    description:
      'Tổng quan học tập được gom thành các thẻ màu: lộ trình, tài nguyên, bài tập, CV và hành động tiếp theo.',
    overlay:
      'bg-[linear-gradient(90deg,rgba(4,21,48,0.96)_0%,rgba(49,46,129,0.80)_47%,rgba(14,165,233,0.22)_100%)]',
    accent: 'bg-sky-300',
    metric: '5+',
    metricLabel: 'khối học chính',
    visualIcon: FileCheck2,
    visualTitle: 'Skill dashboard',
    visualSubtitle: 'Màu sắc theo từng module học',
    visualRows: ['CV ATS: đang tối ưu', 'Resources: 18 gợi ý mới', 'Practice: 4 bài cần làm'],
    visualProgress: 91,
    visualTone: 'from-sky-500 via-blue-500 to-violet-600',
    visualGlow: 'bg-sky-400/30',
    visualChips: ['CV', 'Resources', 'Practice'],
  },
  {
    image: '/hero/interview-studio.webp',
    alt: 'Giao diện minh họa phòng luyện phỏng vấn AI',
    eyebrow: 'Mock interview',
    headline: 'Luyện phỏng vấn có rubric, điểm và phản hồi ngay.',
    description:
      'Bạn có thể luyện theo câu hỏi kỹ thuật, hành vi hoặc bảo vệ dự án, rồi nhận gợi ý cải thiện từng câu trả lời.',
    overlay:
      'bg-[linear-gradient(90deg,rgba(35,10,62,0.96)_0%,rgba(126,34,206,0.78)_45%,rgba(249,115,22,0.22)_100%)]',
    accent: 'bg-orange-300',
    metric: '8/10',
    metricLabel: 'rubric tức thì',
    visualIcon: Mic2,
    visualTitle: 'Mock studio',
    visualSubtitle: 'Voice/text answer → score → better answer',
    visualRows: ['Câu hỏi: system design', 'Rubric: clarity 8/10', 'Gợi ý: thêm trade-off'],
    visualProgress: 88,
    visualTone: 'from-orange-500 via-rose-500 to-violet-600',
    visualGlow: 'bg-orange-400/30',
    visualChips: ['Voice', 'Rubric', 'Score'],
  },
] as const;

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const paused = manuallyPaused || hoverPaused || focusPaused;
  const slide = slides[activeSlide] ?? slides[0];
  const VisualIcon = slide.visualIcon;

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  function showPrevious() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  return (
    <section
      className="home-hero theme-on-color relative isolate h-[calc(100svh-6rem)] min-h-[33rem] max-h-[44rem] overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Giới thiệu MentorMind"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocusPaused(false);
      }}
    >
      <div className="absolute inset-0 bg-[#07111f]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.image}
            className="absolute inset-0"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.015 }}
            transition={{ duration: reduceMotion ? 0 : 0.68, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={activeSlide === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.div
        key={slide.overlay}
        className={cn('absolute inset-0', slide.overlay)}
        initial={{ opacity: 0.78 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.08),transparent_52%,rgba(7,17,31,0.72))]" />

      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-4 pb-24 pt-10 sm:px-6 sm:pb-20 lg:grid-cols-[minmax(0,0.94fr)_minmax(22rem,0.72fr)] lg:px-8">
        <div className="max-w-3xl text-white">
          <motion.div
            key={slide.eyebrow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md sm:text-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {slide.eyebrow}
          </motion.div>

          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.06] text-white sm:text-6xl lg:text-7xl">
            MentorMind
          </h1>
          <motion.p
            key={slide.headline}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.06 }}
            className="mt-4 max-w-2xl text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9"
          >
            {slide.headline}
          </motion.p>
          <motion.p
            key={slide.description}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.1 }}
            className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7"
          >
            {slide.description}
          </motion.p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create-roadmap"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Tạo lộ trình của tôi
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/packages"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-black/20 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Xem gói học 1-1
            </Link>
          </div>

          <div className="mt-6 hidden flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-white/78 sm:flex sm:text-sm">
            {['Có người duyệt lộ trình', 'Mentor theo sát', 'AI hỗ trợ đúng lúc'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          key={`${slide.image}-visual`}
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : 0.08 }}
          className="hidden w-full max-w-md justify-self-end lg:block"
          aria-hidden="true"
        >
          <div className="relative">
            <div className={cn('absolute -inset-8 rounded-[2rem] blur-3xl', slide.visualGlow)} />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/18 bg-white/14 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div
                className={`rounded-[1.5rem] bg-gradient-to-br ${slide.visualTone} p-4 shadow-soft`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </div>
                  <span className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold text-white/90">
                    Live preview
                  </span>
                </div>
                <div className="rounded-[1.25rem] border border-white/16 bg-slate-950/62 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-soft">
                      <VisualIcon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{slide.visualTitle}</p>
                      <p className="mt-1 text-xs leading-5 text-white/68">{slide.visualSubtitle}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {slide.visualRows.map((row, index) => (
                      <div
                        key={row}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-medium text-white/82"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/14 text-[10px]">
                          {index + 1}
                        </span>
                        <span className="min-w-0 truncate">{row}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-white/70">
                      <span>Progress</span>
                      <span>{slide.visualProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/12">
                      <motion.div
                        key={`${slide.image}-progress`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: slide.visualProgress / 100 }}
                        transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full origin-left rounded-full bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {slide.visualChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs font-semibold text-white/78"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/12 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="hidden min-w-0 items-center gap-3 text-white sm:flex">
            <span className={cn('h-9 w-1 shrink-0 rounded-full', slide.accent)} />
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-none sm:text-xl">{slide.metric}</p>
              <p className="mt-1 truncate text-xs text-white/65">{slide.metricLabel}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-start sm:gap-2">
            <button
              type="button"
              onClick={() => setManuallyPaused((current) => !current)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label={manuallyPaused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu'}
              aria-pressed={manuallyPaused}
              title={manuallyPaused ? 'Tiếp tục' : 'Tạm dừng'}
            >
              {manuallyPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={showPrevious}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Ảnh trước"
              title="Ảnh trước"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div
              className="flex h-10 items-center gap-1 px-1"
              role="tablist"
              aria-label="Chọn ảnh hero"
            >
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  role="tab"
                  aria-selected={index === activeSlide}
                  aria-label={`Hiển thị ảnh ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className="relative h-10 w-5 rounded-full focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  <span
                    className={cn(
                      'absolute left-1/2 top-1/2 h-2.5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[background-color,transform] duration-300',
                      index === activeSlide
                        ? 'scale-x-100 bg-white'
                        : 'scale-x-50 bg-white/40 hover:bg-white/70',
                    )}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={showNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-white/8 text-white transition hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label="Ảnh tiếp theo"
              title="Ảnh tiếp theo"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
