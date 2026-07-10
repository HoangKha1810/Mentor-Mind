'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { Account } from '@/lib/domain-types';
import { assetUrl } from '@/lib/api';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '../ui/button';

const publicLinks: Array<[string, string]> = [
  ['Gói học', '/packages'],
  ['Lộ trình AI', '/create-roadmap'],
  ['Luyện code', '/code-practice'],
  ['Phỏng vấn AI', '/ai-interview'],
  ['Tài nguyên', '/resources'],
  ['Bảng giá', '/pricing'],
];

export function SiteNav() {
  const accountQuery = useLiveQuery<Account>('/auth/me', { auth: true });
  const account = accountQuery.data;
  const dashboardHref =
    account?.role === 'ADMIN' || account?.role === 'SUPER_ADMIN'
      ? '/admin'
      : account?.role === 'MENTOR'
        ? '/mentor'
        : '/dashboard';

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/[0.82] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <BrandMark className="h-9 w-9" priority />
          <span className="hidden min-[420px]:inline">MentorMind</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {publicLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        {account ? (
          <Link
            href={dashboardHref}
            className="flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 text-sm font-semibold text-white shadow-soft transition hover:border-secondary/35 hover:bg-secondary/10"
          >
            <Avatar account={account} />
            <span className="hidden max-w-36 truncate sm:inline">{account.fullName}</span>
          </Link>
        ) : accountQuery.loading ? (
          <div className="h-10 w-32 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" aria-label="Đăng nhập">
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" aria-label="Bắt đầu">
                <span className="hidden sm:inline">Bắt đầu</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
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
