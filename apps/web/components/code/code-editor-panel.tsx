'use client';

import Editor from '@monaco-editor/react';
import { Crown, Play, Send, Sparkles } from 'lucide-react';
import { formatCurrency } from '@mentormind/shared';
import { useEffect, useState } from 'react';
import { authHeaders, apiFetch } from '@/lib/api';
import { WalletSummary } from '@/lib/domain-types';
import {
  excerpt,
  LearningAssistantContextSnapshot,
  publishLearningAssistantContext,
} from '@/lib/learning-assistant-context';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

type CodeProblemAssistantContext = NonNullable<LearningAssistantContextSnapshot['problem']>;

export function CodeEditorPanel({
  problemId,
  problemContext,
  starterCode = 'function solve(input) {\n  return input;\n}',
  isPremium = false,
  unlockPrice = 20_000,
}: {
  problemId: string;
  problemContext?: CodeProblemAssistantContext;
  starterCode?: string;
  isPremium?: boolean;
  unlockPrice?: number;
}) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('Chạy code để xem kết quả bộ test mẫu.');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      publishCodeContext('editing', output);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [code]);

  function publishCodeContext(
    lastAction: NonNullable<LearningAssistantContextSnapshot['code']>['lastAction'],
    outputExcerpt?: string,
    result?: unknown,
  ) {
    const verdict = extractVerdict(result);
    const completed = lastAction === 'submit' && isAcceptedVerdict(verdict);
    publishLearningAssistantContext({
      surface: 'code',
      source: 'code-editor',
      title: problemContext?.title ?? 'Luyện code',
      summary: problemContext?.statement
        ? excerpt(problemContext.statement, 220)
        : 'Trợ lý đang theo dõi bài code và nội dung editor hiện tại.',
      problem: problemContext,
      code: {
        language: 'JAVASCRIPT',
        content: code,
        chars: code.length,
        lastAction,
        outputExcerpt: excerpt(outputExcerpt, 1800),
        verdict,
        completed,
      },
      completion: completed
        ? {
            kind: 'code',
            label: `Bài ${problemContext?.title ?? 'code'} đã accepted`,
            query: [problemContext?.title, problemContext?.category, 'javascript algorithm']
              .filter(Boolean)
              .join(' '),
            occurredAt: new Date().toISOString(),
          }
        : undefined,
    });
  }

  async function call(path: string) {
    if (!problemId) {
      setOutput('Không tìm thấy ID bài code. Vui lòng mở bài từ danh sách luyện tập.');
      return;
    }
    const action = path.endsWith('/submit') ? 'submit' : path.endsWith('/ai-hint') ? 'hint' : 'run';
    try {
      const result = await apiFetch(path, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ language: 'JAVASCRIPT', code, hintLevel: 1 }),
      });
      const wallet = extractWallet(result);
      if (wallet) {
        window.dispatchEvent(new CustomEvent('mentormind:wallet-updated', { detail: { wallet } }));
      }
      const nextOutput = JSON.stringify(result, null, 2);
      setOutput(nextOutput);
      publishCodeContext(action, nextOutput, result);
    } catch (err) {
      const nextOutput =
        err instanceof Error
          ? err.message
          : 'Không thể chạy bài hiện tại. Vui lòng mở bài từ danh sách luyện tập đã đồng bộ.';
      setOutput(nextOutput);
      publishCodeContext(action, nextOutput);
    }
  }

  return (
    <div className="grid min-h-[620px] gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card className="overflow-hidden p-0">
        <Editor
          height="620px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value ?? '')}
          options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: 'on' }}
        />
      </Card>
      <Card>
        {isPremium ? (
          <div className="mb-4 rounded-lg border border-secondary/25 bg-secondary/10 p-3 text-sm leading-6 text-slate-100">
            <div className="flex items-center gap-2 font-semibold text-secondary">
              <Crown className="h-4 w-4" />
              Bài code đặc biệt
            </div>
            <p className="mt-1 text-mutedText">
              Gói Pro/Premium được luyện trực tiếp. Nếu bạn đang dùng Free, hệ thống sẽ tự mở khóa
              một lần với phí {formatCurrency(unlockPrice, 'VND')} khi chạy hoặc nộp bài đầu tiên.
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => call(`/code/problems/${problemId}/run`)}>
            <Play className="h-4 w-4" />
            {isPremium ? 'Mở khóa & chạy' : 'Chạy thử'}
          </Button>
          <Button variant="secondary" onClick={() => call(`/code/problems/${problemId}/submit`)}>
            <Send className="h-4 w-4" />
            Nộp bài
          </Button>
          <Button variant="outline" onClick={() => call(`/code/problems/${problemId}/ai-hint`)}>
            <Sparkles className="h-4 w-4" />
            Gợi ý AI
          </Button>
        </div>
        <pre className="mt-4 max-h-[520px] overflow-auto rounded-md border border-white/8 bg-black/30 p-4 text-xs leading-6 text-slate-200">
          {output}
        </pre>
      </Card>
    </div>
  );
}

function extractWallet(value: unknown): WalletSummary | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const direct = record.wallet;
  if (isWallet(direct)) return direct;
  const access = record.access;
  if (access && typeof access === 'object') {
    const wallet = (access as Record<string, unknown>).wallet;
    if (isWallet(wallet)) return wallet;
  }
  return null;
}

function isWallet(value: unknown): value is WalletSummary {
  return value !== null && typeof value === 'object' && 'balance' in value && 'currency' in value;
}

function extractVerdict(value: unknown) {
  const direct = readVerdict(value);
  if (direct) return direct;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return readVerdict(record.result) ?? readVerdict(record.submission);
  }
  return undefined;
}

function readVerdict(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const verdict = (value as Record<string, unknown>).verdict;
  return typeof verdict === 'string' ? verdict : undefined;
}

function isAcceptedVerdict(value?: string) {
  return Boolean(value && /accepted|correct|pass/i.test(value));
}
