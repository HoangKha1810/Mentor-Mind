'use client';

import { CodeEditorPanel } from '@/components/code/code-editor-panel';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeProblem } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';
import { formatCurrency } from '@mentormind/shared';
import { ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function CodeProblemWorkspace({ slug }: { slug: string }) {
  const query = useLiveQuery<CodeProblem>(`/code/problems/${slug}`, { deps: [slug] });

  if (query.loading) return <LoadingCard label="Đang tải đề bài thật..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  return (
    <>
      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <StatusBadge value={query.data.difficulty} />
          <Badge>{query.data.category}</Badge>
          {query.data.isPremium ? (
            <Badge className="border-secondary/30 bg-secondary/10 text-secondary">
              Bài đặc biệt · {formatCurrency(Number(query.data.unlockPrice ?? 20_000), 'VND')}
            </Badge>
          ) : null}
          {query.data.timeLimitMs ? <Badge>{query.data.timeLimitMs}ms</Badge> : null}
          {query.data.memoryLimitMb ? <Badge>{query.data.memoryLimitMb}MB</Badge> : null}
        </div>
        <CardHeader>
          <CardTitle>{query.data.title}</CardTitle>
          <CardDescription>{query.data.statement}</CardDescription>
        </CardHeader>
        <div className="grid gap-3 text-sm text-mutedText md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-200">Input</p>
            <p>{query.data.inputFormat}</p>
          </div>
          <div>
            <p className="font-medium text-slate-200">Output</p>
            <p>{query.data.outputFormat}</p>
          </div>
        </div>
        {query.data.constraintsText ? (
          <p className="mt-3 text-sm text-mutedText">Ràng buộc: {query.data.constraintsText}</p>
        ) : null}
        {query.data.testCases?.length ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-white">Test mẫu</p>
            {query.data.testCases.map((test) => (
              <pre
                key={test.id}
                className="overflow-auto rounded-md border border-white/8 bg-black/20 p-3 text-xs text-slate-200"
              >
                Input: {test.input}
                {'\n'}Output: {test.expectedOutput}
              </pre>
            ))}
          </div>
        ) : null}
      </Card>
      <CodeEditorPanel
        key={query.data.id}
        problemId={query.data.id}
        problemContext={{
          id: query.data.id,
          slug: query.data.slug,
          title: query.data.title,
          difficulty: query.data.difficulty,
          category: query.data.category,
          statement: query.data.statement,
          inputFormat: query.data.inputFormat,
          outputFormat: query.data.outputFormat,
          constraintsText: query.data.constraintsText,
          examples: query.data.testCases,
        }}
        starterCode={query.data.starterCode}
        isPremium={query.data.isPremium}
        unlockPrice={Number(query.data.unlockPrice ?? 20_000)}
      />
    </>
  );
}
