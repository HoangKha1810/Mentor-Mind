import Link from 'next/link';
import { Bot, LogIn, Rocket } from 'lucide-react';
import { Button } from '../ui/button';

const publicLinks: Array<[string, string]> = [
  ['Tutoring Packages', '/packages'],
  ['AI Roadmap', '/create-roadmap'],
  ['Code Practice', '/code-practice'],
  ['AI Interview', '/ai-interview'],
  ['Resources', '/resources'],
  ['Pricing', '/pricing'],
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/20 text-secondary">
            <Bot className="h-5 w-5" />
          </span>
          MentorMind AI
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {publicLinks.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-slate-300 transition hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              <Rocket className="h-4 w-4" />
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
