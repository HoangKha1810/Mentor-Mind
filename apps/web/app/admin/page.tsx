import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { adminStats } from '@/lib/mock-data';

export default function AdminOverviewPage() {
  return (
    <DashboardShell role="admin" title="Admin Overview" subtitle="Operational dashboard for roadmap review, AI usage, bookings, revenue and support.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversion funnel</CardTitle>
            <CardDescription>Visitor to register to roadmap request to consultation to active plan.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>AI usage and cost</CardTitle>
            <CardDescription>Prompt templates, failures and daily budget controls are available in AI Control Center.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </DashboardShell>
  );
}
