'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Code2,
  FileText,
  Home,
  LifeBuoy,
  LogOut,
  Map,
  Menu,
  MessagesSquare,
  Settings,
  X,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function logout() {
    void logoutSession();
    setMobileMenuOpen(false);
    router.replace('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <BrandMark className="h-8 w-8 rounded-md" priority />
            MentorMind
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {role === 'student' ? <WalletWidget /> : null}
            <button
              type="button"
              aria-label="Mở menu dashboard"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 text-sm font-semibold text-white shadow-soft transition hover:border-secondary/40 hover:bg-secondary/10 lg:hidden"
            >
              <Menu className="h-4 w-4" />
              Menu
            </button>
          </div>
        </div>
      </div>
      <aside className="fixed bottom-0 left-0 top-14 hidden w-64 border-r border-white/8 bg-surface/60 p-4 lg:block">
        <nav className="space-y-1.5 pt-2">
          {items.map(([label, href, Icon]) => {
            const isActive = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300 active:scale-95',
                  isActive
                    ? 'border-secondary/20 bg-secondary/10 text-secondary shadow-[0_4px_20px_rgba(0,212,255,0.1)]'
                    : 'border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/10 hover:bg-white/[0.06] hover:text-white hover:shadow-soft',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-transform duration-300 group-hover:scale-110',
                    isActive ? 'text-secondary' : 'text-slate-400 group-hover:text-white',
                  )}
                />
                {label}
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
          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,23rem)] flex-col border-r border-white/12 bg-[#07111f]/98 shadow-[24px_0_80px_rgba(0,0,0,0.42)]">
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
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 text-sm font-semibold text-white transition hover:border-secondary/40 hover:bg-secondary/10"
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
                        ? 'border-secondary/35 bg-secondary/14 text-white shadow-[0_10px_32px_rgba(0,212,255,0.16)]'
                        : 'border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/16 hover:bg-white/[0.07] hover:text-white',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition',
                        isActive
                          ? 'bg-secondary/18 text-secondary'
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
                className="flex min-h-11 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-4 text-sm font-semibold text-slate-200 transition hover:border-white/16 hover:bg-white/[0.07] hover:text-white"
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
      <main className="px-4 pb-12 pt-20 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <PageTransition>
            <div className="mb-8">
              <p className="text-sm font-medium text-secondary">{workspaceLabels[role]}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-mutedText">{subtitle}</p>
            </div>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
