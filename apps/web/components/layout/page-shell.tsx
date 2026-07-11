import { ReactNode } from 'react';
import { SiteNav } from './site-nav';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNav />
      <main className="theme-adaptive">{children}</main>
    </>
  );
}
