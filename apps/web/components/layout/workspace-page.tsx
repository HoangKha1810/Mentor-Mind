import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StaggerContainer, StaggerItem } from '../ui/motion';
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
          <StaggerContainer className="grid gap-3 md:grid-cols-2">
            {highlights.map((item) => (
              <StaggerItem key={item}>
                <div className="flex h-full items-start gap-3 rounded-md border border-white/8 bg-white/[0.03] p-3 transition duration-200 hover:border-secondary/30 hover:bg-white/[0.06]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-sm leading-6 text-slate-200">{item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          {children}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Hành động tiếp theo</CardTitle>
            <CardDescription>Tiếp tục quy trình với bước quan trọng nhất hiện tại.</CardDescription>
          </CardHeader>
          <Button className="w-full">
            Mở quy trình chính
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
    </DashboardShell>
  );
}
