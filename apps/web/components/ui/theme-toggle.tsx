'use client';

import { MouseEvent, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark';

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const storageKey = 'mentormind.theme';

function preferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(storageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('theme-dark', theme === 'dark');
  root.classList.toggle('theme-light', theme === 'light');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', theme === 'dark' ? '#07111f' : '#f4f7ff');
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const next = preferredTheme();
    setTheme(next);
    applyTheme(next);
    setMounted(true);
  }, []);

  function switchTheme(event: MouseEvent<HTMLButtonElement>) {
    if (switching) return;
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    const documentWithTransition = document as ViewTransitionDocument;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      applyTheme(next);
      flushSync(() => setTheme(next));
    };

    if (!documentWithTransition.startViewTransition || reducedMotion) {
      update();
      return;
    }

    setSwitching(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = documentWithTransition.startViewTransition(update);
    void transition.ready.then(() => {
      try {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 720,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            pseudoElement: '::view-transition-new(root)',
          } as KeyframeAnimationOptions & { pseudoElement: string },
        );
      } catch {
        // The theme is already applied; unsupported pseudo-element animation can safely fall back.
      }
    });
    void transition.finished.finally(() => setSwitching(false));
  }

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      aria-label={isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
      aria-pressed={isLight}
      title={isLight ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
      onClick={switchTheme}
      disabled={switching}
      data-mounted={mounted}
      className={cn('theme-toggle-button theme-on-color', className)}
    >
      <motion.span
        key={mounted && isLight ? 'sun' : 'moon'}
        initial={{ opacity: 0, rotate: -55, scale: 0.72 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.24 }}
        className="inline-flex"
        aria-hidden="true"
      >
        {mounted && isLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
      <span className="hidden text-xs font-semibold sm:inline">{mounted && isLight ? 'Sáng' : 'Tối'}</span>
    </button>
  );
}
