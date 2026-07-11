'use client';

import { CodeEditorPanel } from '@/components/code/code-editor-panel';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeProblem } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';
import { formatCurrency, toCurrencyNumber } from '@mentormind/shared';
import { ErrorCard, LoadingCard, StatusBadge } from './live-common';

export function CodeProblemWorkspace({
  slug,
  problem,
  loading,
  error,
  onRetry,
}: {
  slug: string;
  problem?: CodeProblem | null;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  const shouldLoad = problem === undefined;
  const query = useLiveQuery<CodeProblem>(shouldLoad ? `/code/problems/${slug}` : null, {
    deps: [slug],
  });
  const data = shouldLoad ? query.data : problem;
  const isLoading = shouldLoad ? query.loading : Boolean(loading);
  const errorMessage = shouldLoad ? query.error : (error ?? '');
  const retry = shouldLoad ? query.reload : onRetry;

  if (isLoading) return <LoadingCard label="Đang tải đề bài thật..." />;
  if (errorMessage) return <ErrorCard message={errorMessage} onRetry={retry} />;
  if (!data) return null;
  const unlockPrice = toCurrencyNumber(data.unlockPrice ?? 20_000, 20_000);

  return (
    <>
      <Card className="mb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <StatusBadge value={data.difficulty} />
          <Badge>{data.category}</Badge>
          {data.isPremium ? (
            <Badge className="border-secondary/30 bg-secondary/10 text-secondary">
              Bài đặc biệt · {formatCurrency(unlockPrice, 'VND')}
            </Badge>
          ) : null}
          {data.timeLimitMs ? <Badge>{data.timeLimitMs}ms</Badge> : null}
          {data.memoryLimitMb ? <Badge>{data.memoryLimitMb}MB</Badge> : null}
        </div>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <CardDescription>{data.statement}</CardDescription>
        </CardHeader>
        <div className="grid gap-3 text-sm text-mutedText md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-200">Input</p>
            <p>{data.inputFormat}</p>
          </div>
          <div>
            <p className="font-medium text-slate-200">Output</p>
            <p>{data.outputFormat}</p>
          </div>
        </div>
        {data.constraintsText ? (
          <p className="mt-3 text-sm text-mutedText">Ràng buộc: {data.constraintsText}</p>
        ) : null}
        {data.testCases?.length ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-white">Test mẫu</p>
            {data.testCases.map((test) => (
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
        key={data.id}
        problemId={data.id}
        problemContext={{
          id: data.id,
          slug: data.slug,
          title: data.title,
          difficulty: data.difficulty,
          category: data.category,
          statement: data.statement,
          inputFormat: data.inputFormat,
          outputFormat: data.outputFormat,
          constraintsText: data.constraintsText,
          examples: data.testCases,
        }}
        starterCode={data.starterCode}
        isPremium={data.isPremium}
        unlockPrice={unlockPrice}
      />
    </>
  );
}
