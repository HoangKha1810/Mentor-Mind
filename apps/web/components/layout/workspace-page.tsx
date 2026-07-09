import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { DashboardShell } from './dashboard-shell';

export function WorkspacePage({
  role,
  title,
  subtitle,
  highlights,
  children,
}: {
  role: 'student' | 'mentor' | 'admin';
  title: string;
  subtitle: string;
  highlights: string[];
  children?: ReactNode;
}) {
  return (
    <DashboardShell role={role} title={title} subtitle={subtitle}>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md border border-white/8 bg-white/[0.03] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="text-sm leading-6 text-slate-200">{item}</span>
              </div>
            ))}
          </div>
          {children}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Action</CardTitle>
            <CardDescription>Keep the workflow moving with a concrete operational step.</CardDescription>
          </CardHeader>
          <Button className="w-full">
            Open primary workflow
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </DashboardShell>
  );
}
