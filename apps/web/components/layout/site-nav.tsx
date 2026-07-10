'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  Code2,
  Menu,
  MessagesSquare,
  PackageOpen,
  Route,
  UserRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandMark } from '@/components/brand/brand-mark';
import { Account } from '@/lib/domain-types';
import { assetUrl } from '@/lib/api';
import { useLiveQuery } from '@/lib/live-query';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';

type PublicLink = [label: string, href: string, icon: LucideIcon];

const publicLinks: PublicLink[] = [
  ['Gói học', '/packages', PackageOpen],
  ['Lộ trình AI', '/create-roadmap', Route],
  ['Luyện code', '/code-practice', Code2],
  ['Phỏng vấn AI', '/ai-interview', MessagesSquare],
  ['Tài nguyên', '/resources', BookOpen],
  ['Bảng giá', '/pricing', BadgeDollarSign],
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountQuery = useLiveQuery<Account>('/auth/me', { auth: true });
  const account = accountQuery.data;
  const dashboardHref =
    account?.role === 'ADMIN' || account?.role === 'SUPER_ADMIN'
      ? '/admin'
      : account?.role === 'MENTOR'
        ? '/mentor'
        : '/dashboard';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-white/8 bg-background/[0.82] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <BrandMark className="h-9 w-9" priority />
          <span className="hidden min-[420px]:inline">MentorMind</span>
        </Link>
        <nav className="hidden shrink-0 items-center gap-1 xl:flex" aria-label="Điều hướng chính">
          {publicLinks.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition',
                isPublicLinkActive(pathname, href)
                  ? 'theme-on-color bg-blue-500 text-white shadow-[0_10px_26px_rgba(37,99,235,0.26)]'
                  : 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {account ? (
            <Link
              href={dashboardHref}
              className="hidden min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-sm font-semibold text-white shadow-soft transition hover:border-secondary/35 hover:bg-secondary/10 sm:flex"
            >
              <Avatar account={account} />
              <span className="hidden max-w-36 truncate md:inline">{account.fullName}</span>
            </Link>
          ) : accountQuery.loading ? (
            <div className="hidden h-10 w-28 animate-pulse rounded-full border border-white/10 bg-white/[0.04] lg:block" />
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm" aria-label="Đăng nhập">
                  <UserRound className="h-4 w-4" />
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <span className="landing-start-button" aria-label="Bắt đầu">
                  <span>Bắt đầu</span>
                  <span className="icon">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </div>
          )}
          <button
            type="button"
            className="site-menu-button inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white transition hover:border-secondary/35 hover:bg-secondary/10 xl:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-menu"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            title={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen ? (
        <div
          id="site-mobile-menu"
          className="site-mobile-menu absolute inset-x-0 top-16 border-b border-white/10 bg-background/[0.97] px-4 py-4 shadow-[0_22px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:px-6 xl:hidden"
        >
          <nav className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2" aria-label="Điều hướng mobile">
            {publicLinks.map(([label, href, Icon]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-lg border px-4 text-sm font-semibold transition',
                  isPublicLinkActive(pathname, href)
                    ? 'theme-on-color border-blue-400/35 bg-blue-500 text-white'
                    : 'border-white/8 bg-white/[0.035] text-slate-200 hover:border-secondary/25 hover:bg-secondary/10',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mx-auto mt-4 flex max-w-7xl items-center gap-2 border-t border-white/10 pt-4">
            {account ? (
              <Link
                href={dashboardHref}
                className="flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white"
              >
                <Avatar account={account} />
                <span className="min-w-0 truncate">{account.fullName}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 text-sm font-semibold text-white"
                >
                  <UserRound className="h-4 w-4" />
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="theme-on-color inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 text-sm font-semibold text-white shadow-soft"
                >
                  Bắt đầu
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function isPublicLinkActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Avatar({ account }: { account: Account }) {
  const image = assetUrl(account.avatarUrl);
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-secondary/12 text-xs font-bold text-secondary">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={account.fullName} className="h-full w-full object-cover" />
      ) : (
        initials(account.fullName)
      )}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
