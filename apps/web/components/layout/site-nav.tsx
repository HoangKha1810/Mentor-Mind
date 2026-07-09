import Link from 'next/link';
import { LogIn, Rocket } from 'lucide-react';
import { BrandMark } from '@/components/brand/brand-mark';
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
