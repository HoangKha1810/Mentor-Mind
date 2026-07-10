'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Code2,
  CreditCard,
  FileText,
  Home,
  LifeBuoy,
  LogOut,
  Map,
  Menu,
  MessagesSquare,
  Settings,
  Search,
  X,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { LearningAssistantWidget } from '@/components/dashboard/learning-assistant-widget';
import { WalletWidget } from '@/components/payments/wallet-widget';
import { PageTransition } from '../ui/motion';
import { logoutSession } from '@/lib/api';
import { cn } from '@/lib/utils';

type NavItem = [label: string, href: string, icon: LucideIcon];

const nav: Record<'student' | 'mentor' | 'admin', NavItem[]> = {
  student: [
    ['Tổng quan', '/dashboard', BarChart3],
    ['Lộ trình của tôi', '/dashboard/roadmaps', Map],
    ['Lịch học', '/dashboard/bookings', CalendarDays],
    ['Luyện code', '/dashboard/code-practice', Code2],
    ['Phỏng vấn AI', '/dashboard/interview', MessagesSquare],
    ['Tài nguyên', '/dashboard/resources', BookOpen],
    ['Sửa CV', '/dashboard/cv-review', FileText],
    ['Trợ lý AI', '/dashboard/ai-assistant', Bot],
    ['Ví & nạp tiền', '/dashboard/payments/top-up', CreditCard],
    ['Thông báo', '/dashboard/notifications', Bell],
    ['Hỗ trợ', '/dashboard/support', LifeBuoy],
    ['Hồ sơ', '/dashboard/profile', Settings],
  ],
  mentor: [
    ['Tổng quan', '/mentor', BarChart3],
    ['Lịch dạy', '/mentor/schedule', CalendarDays],
    ['Học viên', '/mentor/students', Users],
    ['Chấm bài tập', '/mentor/homework', FileText],
  ],
  admin: [
    ['Tổng quan', '/admin', BarChart3],
    ['Người dùng', '/admin/users', Users],
    ['Gói học', '/admin/packages', BookOpen],
    ['Yêu cầu lộ trình', '/admin/roadmap-requests', Map],
    ['Lịch học', '/admin/bookings', CalendarDays],
    ['Bài code', '/admin/code-problems', Code2],
    ['Câu hỏi phỏng vấn', '/admin/interview-questions', MessagesSquare],
    ['Tài nguyên', '/admin/resources', BookOpen],
    ['Trung tâm AI', '/admin/ai', Bot],
    ['Thanh toán', '/admin/payments', FileText],
    ['Hỗ trợ', '/admin/support', LifeBuoy],
    ['Nhật ký hệ thống', '/admin/audit-logs', Settings],
  ],
};

const workspaceLabels: Record<keyof typeof nav, string> = {
  student: 'Không gian học viên',
  mentor: 'Không gian mentor',
  admin: 'Không gian quản trị',
};

function isNavActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/dashboard' || href === '/mentor' || href === '/admin') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({
  title,
  subtitle,
  role = 'student',
  children,
}: {
  title: string;
  subtitle: string;
  role?: keyof typeof nav;
  children: ReactNode;
}) {
  const items = nav[role];
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function logout() {
    void logoutSession();
    setMobileMenuOpen(false);
    router.replace('/login');
  }

  function submitQuickSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = quickSearch.trim();
    if (!query) return;
    setQuickSearch('');
    router.push(`/dashboard/resources?query=${encodeURIComponent(query)}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="dashboard-backdrop" aria-hidden="true" />
      <div className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#07111f]/[0.82] shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
        <div className="flex h-20 items-center justify-between px-5 lg:px-8">
          <Link href="/" className="group flex items-center gap-3 text-base font-semibold">
            <span className="dashboard-surface flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.05] shadow-[0_14px_42px_rgba(0,212,255,0.12)] transition group-hover:border-secondary/30">
              <BrandMark className="h-10 w-10 rounded-lg" priority />
            </span>
            <span className="hidden sm:block">
              <span className="block text-lg leading-none text-white">MentorMind</span>
              <span className="mt-1 block text-xs font-medium text-secondary">
                {workspaceLabels[role]}
              </span>
            </span>
          </Link>
          <form
            onSubmit={submitQuickSearch}
            className="ml-auto hidden w-[min(34vw,26rem)] items-center rounded-full border border-white/[0.10] bg-white/[0.05] px-4 py-2 transition focus-within:border-secondary/35 focus-within:bg-white/[0.075] xl:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-mutedText" />
            <input
              value={quickSearch}
              onChange={(event) => setQuickSearch(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-white outline-none placeholder:text-mutedText"
              placeholder="Tìm tài liệu, chủ đề, tag..."
            />
          </form>
          <div className="flex items-center gap-2">
            {role === 'student' ? <WalletWidget /> : null}
            <button
              type="button"
              aria-label="Mở menu dashboard"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-4 text-sm font-semibold text-white shadow-soft transition hover:border-secondary/40 hover:bg-secondary/[0.10] lg:hidden"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>
      </div>
      <aside className="fixed bottom-0 left-0 top-20 z-30 hidden w-72 border-r border-white/10 bg-[#07111f]/[0.64] p-5 shadow-[18px_0_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl lg:block">
        <div className="mb-5 rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Workspace
          </p>
          <p className="mt-2 text-sm font-semibold text-white">{workspaceLabels[role]}</p>
        </div>
        <nav className="space-y-2">
          {items.map(([label, href, Icon]) => {
            const isActive = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'dashboard-nav-link group flex min-h-[3.65rem] items-center gap-3 rounded-xl border px-4 py-3 text-[15px] font-semibold transition-all duration-300 active:scale-[0.98]',
                  isActive
                    ? 'border-secondary/30 bg-secondary/[0.12] text-white shadow-[0_12px_38px_rgba(0,212,255,0.14)]'
                    : 'border-white/[0.07] bg-white/[0.025] text-slate-300 hover:border-white/[0.14] hover:bg-white/[0.065] hover:text-white hover:shadow-soft',
                )}
              >
                <span
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition duration-300 group-hover:scale-105',
                    isActive
                      ? 'bg-secondary/[0.16] text-secondary shadow-[0_0_24px_rgba(0,212,255,0.16)]'
                      : 'bg-white/[0.05] text-slate-400 group-hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="relative z-10 min-w-0 flex-1 truncate">{label}</span>
                {isActive ? (
                  <span className="relative z-10 h-2 w-2 shrink-0 rounded-full bg-secondary" />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,23rem)] flex-col border-r border-white/[0.12] bg-[#07111f]/[0.98] shadow-[24px_0_80px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <BrandMark className="h-11 w-11 rounded-xl" priority />
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-white">MentorMind</div>
                  <div className="text-xs font-medium text-secondary">{workspaceLabels[role]}</div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.05] px-3 text-sm font-semibold text-white transition hover:border-secondary/40 hover:bg-secondary/[0.10]"
              >
                <X className="h-4 w-4" />
                Đóng
              </button>
            </div>
            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {items.map(([label, href, Icon]) => {
                const isActive = isNavActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'group flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]',
                      isActive
                        ? 'border-secondary/35 bg-secondary/[0.14] text-white shadow-[0_10px_32px_rgba(0,212,255,0.16)]'
                        : 'border-white/[0.08] bg-white/[0.025] text-slate-300 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
                        isActive
                          ? 'bg-secondary/[0.18] text-secondary'
                          : 'bg-white/[0.05] text-slate-400',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    {isActive && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />}
                  </Link>
                );
              })}
            </nav>
            <div className="space-y-2 border-t border-white/10 p-4">
              <Link
                href="/"
                className="flex min-h-11 items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-semibold text-slate-200 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
              >
                <Home className="h-4 w-4 text-secondary" />
                Về trang chủ
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-red-300/20 bg-red-500/10 px-4 text-left text-sm font-semibold text-red-100 transition hover:border-red-300/35 hover:bg-red-500/16"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}
      <main className="relative z-10 px-4 pb-14 pt-28 lg:ml-72 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <PageTransition>
            <div className="dashboard-hero mb-8 rounded-2xl px-5 py-6 sm:px-7">
              <div className="relative z-10">
                <p className="text-sm font-semibold text-secondary">{workspaceLabels[role]}</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{subtitle}</p>
              </div>
            </div>
            {children}
          </PageTransition>
        </div>
      </main>
      {role === 'student' ? <LearningAssistantWidget /> : null}
    </div>
  );
}
