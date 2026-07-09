import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { dashboardStats } from '@/lib/mock-data';

export default function MentorOverviewPage() {
  return (
    <DashboardShell role="mentor" title="Mentor Overview" subtitle="Upcoming sessions, assigned students, at-risk learners and pending homework reviews.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Students at risk</CardTitle>
          <CardDescription>AI-generated insight placeholders surface stalled roadmap items and low interview scores.</CardDescription>
        </CardHeader>
      </Card>
    </DashboardShell>
  );
}
