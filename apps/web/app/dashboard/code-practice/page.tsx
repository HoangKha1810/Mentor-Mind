import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { codingProblems } from '@/lib/mock-data';

export default function CodePracticeDashboard() {
  return (
    <DashboardShell title="Code Practice" subtitle="Browse problems, run public tests, submit hidden tests and request AI hints.">
      <div className="grid gap-4 lg:grid-cols-2">
        {codingProblems.map((problem) => (
          <Card key={problem.slug}>
            <div className="flex items-center justify-between">
              <Badge>{problem.difficulty}</Badge>
              <Badge>{problem.solved ? 'Solved' : 'Unsolved'}</Badge>
            </div>
            <CardHeader className="mt-3">
              <CardTitle>{problem.title}</CardTitle>
              <CardDescription>{problem.category}</CardDescription>
            </CardHeader>
            <Link href={`/dashboard/code-practice/${problem.slug}`}>
              <Button>Open problem</Button>
            </Link>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
