import { CodeEditorPanel } from '@/components/code/code-editor-panel';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CodeProblemPage({ params }: { params: { slug: string } }) {
  return (
    <DashboardShell title={params.slug.replaceAll('-', ' ')} subtitle="Problem statement, Monaco editor, test results, AI hint and AI review panels.">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
          <CardDescription>
            Implement the function for the selected problem. API-backed runs need the seeded problem id; the UI keeps a mock panel for local exploration.
          </CardDescription>
        </CardHeader>
      </Card>
      <CodeEditorPanel />
    </DashboardShell>
  );
}
