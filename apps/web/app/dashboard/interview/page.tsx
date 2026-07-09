import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function InterviewDashboard() {
  return (
    <DashboardShell title="AI Interview" subtitle="Start mock interviews, track score trends and review weak areas.">
      <div className="grid gap-4 lg:grid-cols-3">
        {['Technical interview', 'Project defense', 'English interview'].map((mode) => (
          <Card key={mode}>
            <CardHeader>
              <CardTitle>{mode}</CardTitle>
              <CardDescription>Role-specific questions with rubric feedback and better-answer suggestions.</CardDescription>
            </CardHeader>
            <Link href="/dashboard/interview/new">
              <Button>
                <MessageSquarePlus className="h-4 w-4" />
                Start
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
