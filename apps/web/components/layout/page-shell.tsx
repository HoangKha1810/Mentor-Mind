import { ReactNode } from 'react';
import { PageTransition } from '../ui/motion';
import { SiteNav } from './site-nav';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="theme-adaptive">
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  );
}
