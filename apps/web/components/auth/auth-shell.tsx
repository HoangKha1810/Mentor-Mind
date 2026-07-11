import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { CheckCircle2, LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
  return (
    <main className="auth-gradient relative flex min-h-[100dvh] items-center justify-center px-4 py-8 text-slate-900 sm:px-6">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <section className="auth-card auth-card-shadow grid w-full max-w-5xl overflow-hidden rounded-lg bg-white lg:grid-cols-[1.05fr_0.95fr]">
        <div className="auth-visual-panel relative hidden min-h-[620px] flex-col justify-between overflow-hidden bg-[#f8fbff] px-12 py-12 lg:flex">
          <Link
            href="/"
            className="flex w-fit items-center gap-3 text-sm font-semibold text-slate-700"
          >
            <BrandMark className="h-10 w-10" priority />
            MentorMind
          </Link>

          <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
            <div className="group relative">
              <div className="absolute inset-8 rounded-full bg-[#57b846]/10 blur-3xl transition duration-500 group-hover:bg-[#57b846]/18" />
              <Image
                src="/auth/login-illustration.png"
                width={316}
                height={289}
                alt="MentorMind secure login"
                priority
                className="relative transition duration-500 group-hover:-translate-y-2 group-hover:scale-105"
              />
            </div>
            <p className="mt-8 text-sm font-semibold text-[#57b846]">{eyebrow}</p>
            <h1 className="mt-3 font-display text-3xl text-slate-900">{title}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">{subtitle}</p>
          </div>

          <div className="grid gap-3">
            {['Lộ trình cá nhân hóa', 'Mentor theo sát', 'AI hỗ trợ luyện tập'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-soft"
              >
                <CheckCircle2 className="h-4 w-4 text-[#57b846]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-form-panel flex min-h-[620px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <Link
            href="/"
            className="mb-10 flex w-fit items-center gap-3 text-sm font-semibold text-slate-700 lg:hidden"
          >
            <BrandMark className="h-10 w-10" priority />
            MentorMind
          </Link>
          {children}
          <p className="mt-10 text-center text-sm text-slate-500">
            {switchText}{' '}
            <Link
              href={switchHref}
              className="font-semibold text-[#57b846] transition hover:text-slate-900"
            >
              {switchLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export function AuthInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { icon: LucideIcon }) {
  return (
    <label className="group relative block">
      <Input
        className={cn(
          'auth-input h-[50px] rounded-full border-transparent bg-[#e6e6e6] pl-14 pr-5 font-medium text-[#666] placeholder:text-[#999] hover:bg-[#dedede] focus:border-transparent focus:bg-[#f2f6f2] focus:text-slate-800 focus:ring-4 focus:ring-[#57b846]/20',
          className,
        )}
        {...props}
      />
      <Icon className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666] transition duration-200 group-focus-within:left-6 group-focus-within:text-[#57b846]" />
    </label>
  );
}
