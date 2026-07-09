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

type NavItem = [label: string, href: string, icon: LucideIcon];

const nav: Record<'student' | 'mentor' | 'admin', NavItem[]> = {
  student: [
    ['Overview', '/dashboard', BarChart3],
    ['My Roadmaps', '/dashboard/roadmaps', Map],
    ['Bookings', '/dashboard/bookings', CalendarDays],
    ['Code Practice', '/dashboard/code-practice', Code2],
    ['AI Interview', '/dashboard/interview', MessagesSquare],
    ['Resources', '/dashboard/resources', BookOpen],
    ['CV Review', '/dashboard/cv-review', FileText],
    ['AI Assistant', '/dashboard/ai-assistant', Bot],
    ['Notifications', '/dashboard/notifications', Bell],
    ['Support', '/dashboard/support', LifeBuoy],
    ['Profile', '/dashboard/profile', Settings],
  ],
  mentor: [
    ['Overview', '/mentor', BarChart3],
    ['Schedule', '/mentor/schedule', CalendarDays],
    ['Students', '/mentor/students', Users],
    ['Homework Reviews', '/mentor/homework', FileText],
  ],
  admin: [
    ['Overview', '/admin', BarChart3],
    ['Users', '/admin/users', Users],
    ['Packages', '/admin/packages', BookOpen],
    ['Roadmap Requests', '/admin/roadmap-requests', Map],
    ['Bookings', '/admin/bookings', CalendarDays],
    ['Code Problems', '/admin/code-problems', Code2],
    ['Interview Questions', '/admin/interview-questions', MessagesSquare],
    ['Resources', '/admin/resources', BookOpen],
    ['AI Control Center', '/admin/ai', Bot],
    ['Payments', '/admin/payments', FileText],
    ['Support', '/admin/support', LifeBuoy],
    ['Audit Logs', '/admin/audit-logs', Settings],
  ],
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
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-secondary">
              <Bot className="h-4 w-4" />
            </span>
            MentorMind AI
          </Link>
          <div className="text-xs text-mutedText">Mock mode ready</div>
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
          <div className="mb-8">
            <p className="text-sm font-medium text-secondary">{role.toUpperCase()} WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-white">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-mutedText">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
