import Link from 'next/link';
import { ReactNode } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  Code2,
  FileText,
  LifeBuoy,
  Map,
  MessagesSquare,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
import { PageTransition } from '../ui/motion';

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
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-30 border-b border-white/8 bg-background/90 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <BrandMark className="h-8 w-8 rounded-md" priority />
            MentorMind
          </Link>
          <div className="text-xs text-mutedText">Sẵn sàng vận hành</div>
        </div>
      </div>
      <aside className="fixed bottom-0 left-0 top-14 hidden w-64 border-r border-white/8 bg-surface/60 p-4 lg:block">
        <nav className="space-y-1">
          {items.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
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
