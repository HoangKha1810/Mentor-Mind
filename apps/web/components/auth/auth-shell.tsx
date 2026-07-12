'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { CheckCircle2, LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const benefits = ['Lộ trình cá nhân hóa', 'Mentor theo sát', 'AI hỗ trợ luyện tập'];

export function AuthShell({
  title,
  subtitle,
  eyebrow,
  switchText,
  switchLabel,
  switchHref,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  switchText: string;
  switchLabel: string;
  switchHref: string;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [motionPreferenceReady, setMotionPreferenceReady] = useState(false);
  const reduceMotion = motionPreferenceReady && Boolean(prefersReducedMotion);

  useEffect(() => setMotionPreferenceReady(true), []);

  return (
    <main className="relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#031116] px-4 py-6 text-foreground sm:px-6 sm:py-8 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,212,255,0.08),transparent_38%,rgba(16,185,129,0.08)_76%,transparent)]"
        aria-hidden="true"
      />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <section className="auth-entry-shell relative z-10 grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-white/90 shadow-[0_32px_110px_rgba(1,18,24,0.52),inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-[#071820]/90 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative min-h-[12.5rem] overflow-hidden bg-[#061a21] px-6 py-6 text-white sm:px-8 lg:min-h-[680px] lg:px-12 lg:py-10">
          <motion.div
            className="auth-mesh-layer pointer-events-none absolute -inset-[22%] opacity-95"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 18% 24%, rgba(6,182,212,0.58) 0%, rgba(6,182,212,0.16) 27%, transparent 52%), radial-gradient(ellipse at 78% 30%, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.14) 29%, transparent 55%), radial-gradient(ellipse at 54% 82%, rgba(8,145,178,0.46) 0%, rgba(5,46,55,0.18) 36%, transparent 62%), linear-gradient(145deg, #04151b 8%, #082a31 52%, #06241f 100%)',
            }}
            initial={false}
            animate={
              reduceMotion
                ? { x: 0, y: 0, scale: 1 }
                : {
                    x: ['-3%', '3%', '-1%'],
                    y: ['-2%', '2%', '-1%'],
                    scale: [1, 1.035, 1.01],
                  }
            }
            transition={{
              duration: 16,
              ease: 'easeInOut',
              repeat: reduceMotion ? 0 : Infinity,
              repeatType: 'mirror',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,22,0.04),rgba(3,17,22,0.4))]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full flex-col">
            <Link
              href="/"
              className="flex w-fit items-center gap-3 rounded-full text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-4 focus-visible:ring-offset-[#061a21]"
            >
              <BrandMark className="h-10 w-10" priority />
              MentorMind
            </Link>

            <div className="auth-entry-copy mt-auto max-w-md pt-8 lg:mx-auto lg:my-auto lg:pt-6">
              <p className="mt-0 text-sm font-semibold text-emerald-300">{eyebrow}</p>
              <h1 className="mt-2 max-w-md font-display text-2xl leading-tight text-white sm:text-3xl lg:mt-3">
                {title}
              </h1>
              <p className="mt-3 hidden max-w-md text-sm leading-6 text-cyan-50/[0.72] sm:block lg:mt-4 lg:leading-7">
                {subtitle}
              </p>
            </div>

            <ul className="mt-8 hidden gap-2.5 lg:grid">
              {benefits.map((item, index) => (
                <li
                  key={item}
                  style={{ animationDelay: `${180 + index * 80}ms` }}
                  className="auth-entry-benefit auth-glass-surface auth-dark-glass-surface flex items-center gap-3 rounded-lg border border-white/10 bg-[#08232b]/[0.48] px-4 py-3 text-sm font-medium text-cyan-50/[0.88] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-lg"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="auth-glass-surface relative flex min-h-[34rem] flex-col justify-center bg-white/[0.88] px-6 py-9 text-slate-900 backdrop-blur-2xl sm:px-10 sm:py-11 dark:bg-[#071820]/[0.88] dark:text-slate-100 lg:min-h-[680px] lg:px-14">
          <div className="auth-entry-form">{children}</div>
          <p className="mt-8 text-center text-sm text-mutedText sm:mt-10">
            {switchText}{' '}
            <Link
              href={switchHref}
              className="rounded-sm font-semibold text-emerald-700 outline-none transition hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-emerald-500/60 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              {switchLabel}
            </Link>
          </p>
        </div>
      </section>

      <style>{`
        .auth-entry-shell,
        .auth-entry-copy,
        .auth-entry-form,
        .auth-entry-benefit {
          animation-duration: 520ms;
          animation-fill-mode: both;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }

        .auth-entry-shell {
          animation-name: auth-rise-in;
        }

        .auth-entry-copy {
          animation-delay: 80ms;
          animation-name: auth-rise-in;
        }

        .auth-entry-form {
          animation-delay: 140ms;
          animation-name: auth-rise-in;
        }

        .auth-entry-benefit {
          animation-name: auth-slide-in;
        }

        @keyframes auth-rise-in {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes auth-slide-in {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-transparency: reduce) {
          .auth-glass-surface {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background-color: #f8fafc !important;
          }

          .theme-dark .auth-glass-surface {
            background-color: #071820 !important;
          }

          .auth-dark-glass-surface,
          .theme-dark .auth-dark-glass-surface {
            background-color: #08232b !important;
          }

          .auth-glass-input {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background-color: #ffffff !important;
          }

          .theme-dark .auth-glass-input {
            background-color: #10272e !important;
          }

          .auth-mesh-layer {
            opacity: 0.72 !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-entry-shell,
          .auth-entry-copy,
          .auth-entry-form,
          .auth-entry-benefit,
          .auth-mesh-layer {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }

        .theme-light .auth-glass-input::placeholder {
          color: #64748b;
          opacity: 1;
        }
      `}</style>
    </main>
  );
}

export function AuthInput({
  icon: Icon,
  label,
  className,
  id,
  name,
  ...props
}: React.ComponentProps<typeof Input> & { icon: LucideIcon; label: string }) {
  const inputId = id ?? (typeof name === 'string' ? `auth-${name}` : undefined);

  return (
    <label htmlFor={inputId} className="block space-y-2">
      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      <span className="group relative block">
        <Input
          id={inputId}
          name={name}
          className={cn(
            'auth-glass-input h-[50px] rounded-xl border-slate-300/70 bg-white/[0.64] pl-12 pr-4 font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-xl placeholder:text-slate-500 hover:border-emerald-500/[0.35] hover:bg-white/[0.82] focus-visible:border-emerald-500/70 focus-visible:bg-white/[0.94] focus-visible:ring-4 focus-visible:ring-emerald-500/[0.12] focus-visible:shadow-[0_0_0_4px_rgba(16,185,129,0.08),0_16px_38px_rgba(6,95,70,0.14)] dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:placeholder:text-slate-400 dark:hover:border-emerald-300/30 dark:hover:bg-white/[0.085] dark:focus-visible:border-emerald-300/60 dark:focus-visible:bg-white/[0.09] dark:focus-visible:ring-emerald-300/[0.12]',
            className,
          )}
          {...props}
        />
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-[color,transform] duration-200 group-focus-within:scale-105 group-focus-within:text-emerald-600 dark:text-slate-400 dark:group-focus-within:text-emerald-300"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
