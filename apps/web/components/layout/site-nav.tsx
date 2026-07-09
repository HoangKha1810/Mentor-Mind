import Link from 'next/link';
import { Bot, LogIn, Rocket } from 'lucide-react';
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
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 text-secondary">
            <Bot className="h-5 w-5" />
          </span>
          <span className="hidden min-[420px]:inline">MentorMind AI</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {publicLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" aria-label="Đăng nhập">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" aria-label="Bắt đầu">
              <Rocket className="h-4 w-4" />
              <span className="hidden sm:inline">Bắt đầu</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
