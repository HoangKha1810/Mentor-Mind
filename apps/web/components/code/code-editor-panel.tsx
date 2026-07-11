'use client';

import Editor from '@monaco-editor/react';
import {
  codingLanguageOptions,
  codingLanguageStarterCode,
  formatCurrency,
  type CodingLanguage,
} from '@mentormind/shared';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Code2,
  Crown,
  Lightbulb,
  Loader2,
  MemoryStick,
  Play,
  Send,
  Sparkles,
  TerminalSquare,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { authHeaders, apiFetch } from '@/lib/api';
import { WalletSummary } from '@/lib/domain-types';
import {
  excerpt,
  LearningAssistantContextSnapshot,
  publishLearningAssistantContext,
} from '@/lib/learning-assistant-context';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

type CodeProblemAssistantContext = NonNullable<LearningAssistantContextSnapshot['problem']>;
type CodeAction = 'run' | 'submit' | 'hint';
type CodeLanguage = CodingLanguage;

type JudgeTestResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
};

type JudgeResult = {
  verdict: string;
  runtimeMs: number;
  memoryKb: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  publicResults: JudgeTestResult[];
};

type HintResult = {
  hint: string;
  hintLevel?: number;
  nextAction?: string;
  revealsSolution?: boolean;
};

type OutputState =
  | { status: 'idle' }
  | { status: 'loading'; action: CodeAction }
  | { status: 'judge'; action: 'run' | 'submit'; result: JudgeResult }
  | { status: 'hint'; result: HintResult }
  | { status: 'error'; action: CodeAction; message: string };

const languageOptions = codingLanguageOptions;
const fallbackStarters: Record<CodeLanguage, string> = { ...codingLanguageStarterCode };

export function CodeEditorPanel({
  problemId,
  problemContext,
  starterCode,
  isPremium = false,
  unlockPrice = 20_000,
}: {
  problemId: string;
  problemContext?: CodeProblemAssistantContext;
  starterCode?: Record<string, string> | string;
  isPremium?: boolean;
  unlockPrice?: number;
}) {
  const [language, setLanguage] = useState<CodeLanguage>('JAVASCRIPT');
  const [drafts, setDrafts] = useState<Record<CodeLanguage, string>>(() =>
    buildLanguageDrafts(starterCode),
  );
  const [output, setOutput] = useState<OutputState>({ status: 'idle' });
  const code = drafts[language];
  const languageMeta = languageOptions.find((item) => item.value === language)!;
  const busy = output.status === 'loading';

  useEffect(() => {
    setLanguage('JAVASCRIPT');
    setDrafts(buildLanguageDrafts(starterCode));
    setOutput({ status: 'idle' });
  }, [problemId, starterCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      publishCodeContext('editing', `Đang chỉnh sửa bằng ${languageMeta.label}.`);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [code, language]);

  function updateCode(value: string) {
    setDrafts((current) => ({ ...current, [language]: value }));
  }

  function changeLanguage(nextLanguage: CodeLanguage) {
    setLanguage(nextLanguage);
    setOutput({ status: 'idle' });
  }

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
        language,
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
            query: [
              problemContext?.title,
              problemContext?.category,
              languageMeta.label,
              'algorithm',
            ]
              .filter(Boolean)
              .join(' '),
            occurredAt: new Date().toISOString(),
          }
        : undefined,
    });
  }

  async function call(action: CodeAction) {
    if (!problemId) {
      const message = 'Không tìm thấy ID bài code. Vui lòng mở bài từ danh sách luyện tập.';
      setOutput({ status: 'error', action, message });
      return;
    }

    setOutput({ status: 'loading', action });
    const path = `/code/problems/${problemId}/${action === 'hint' ? 'ai-hint' : action}`;
    try {
      const response = await apiFetch<unknown>(path, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ language, code, hintLevel: 1 }),
      });
      const wallet = extractWallet(response);
      if (wallet) {
        window.dispatchEvent(new CustomEvent('mentormind:wallet-updated', { detail: { wallet } }));
      }

      if (action === 'hint') {
        const hint = normalizeHintResult(response);
        if (!hint) throw new Error('Trợ lý chưa trả về nội dung gợi ý. Vui lòng thử lại.');
        setOutput({ status: 'hint', result: hint });
        publishCodeContext('hint', buildHintSummary(hint), response);
        return;
      }

      const result = normalizeJudgeResult(response);
      if (!result) throw new Error('Máy chấm chưa trả về kết quả hợp lệ. Vui lòng chạy lại.');
      setOutput({ status: 'judge', action, result });
      publishCodeContext(action, buildJudgeSummary(result), response);
    } catch (err) {
      const message = humanizeError(
        err instanceof Error ? err.message : 'Không thể chạy bài hiện tại. Vui lòng thử lại sau.',
      );
      setOutput({ status: 'error', action, message });
      publishCodeContext(action, message);
    }
  }

  return (
    <div className="grid min-h-[620px] gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Card className="overflow-hidden p-0">
        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Code2 className="h-4 w-4 text-secondary" />
            Trình soạn thảo
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-mutedText">
            Ngôn ngữ
            <select
              aria-label="Chọn ngôn ngữ lập trình"
              disabled={busy}
              value={language}
              onChange={(event) => changeLanguage(event.target.value as CodeLanguage)}
              className="h-9 min-w-36 rounded-md border border-white/12 bg-[#101a2b] px-3 text-sm font-semibold text-white outline-none transition-colors focus:border-secondary/60 focus:ring-2 focus:ring-secondary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {languageOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Editor
          height="564px"
          language={languageMeta.editorLanguage}
          theme="vs-dark"
          value={code}
          onChange={(value) => updateCode(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 22,
            padding: { top: 14, bottom: 14 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
          }}
        />
      </Card>

      <Card className="flex min-h-[620px] flex-col">
        {isPremium ? (
          <div className="mb-4 rounded-lg border border-secondary/25 bg-secondary/10 p-3 text-sm leading-6 text-foreground">
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
          <Button disabled={busy} onClick={() => call('run')}>
            {busy && output.action === 'run' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isPremium ? 'Mở khóa & chạy' : 'Chạy thử'}
          </Button>
          <Button disabled={busy} variant="secondary" onClick={() => call('submit')}>
            {busy && output.action === 'submit' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Nộp bài
          </Button>
          <Button disabled={busy} variant="outline" onClick={() => call('hint')}>
            {busy && output.action === 'hint' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gợi ý AI
          </Button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg border border-white/8 bg-black/20 p-4">
          <ResultPanel state={output} languageLabel={languageMeta.label} />
        </div>
      </Card>
    </div>
  );
}

function ResultPanel({ state, languageLabel }: { state: OutputState; languageLabel: string }) {
  if (state.status === 'idle') {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10 text-secondary">
          <TerminalSquare className="h-6 w-6" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Kết quả sẽ hiển thị tại đây
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-mutedText">
          Chọn Chạy thử để kiểm tra test mẫu hoặc Nộp bài để chấm toàn bộ test bằng {languageLabel}.
        </p>
      </div>
    );
  }

  if (state.status === 'loading') {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        <h3 className="mt-4 font-semibold text-foreground">
          {state.action === 'hint' ? 'Đang tạo gợi ý...' : 'Máy chấm đang chạy code...'}
        </h3>
        <p className="mt-2 text-sm text-mutedText">Ngôn ngữ: {languageLabel}</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-lg border border-danger/25 bg-danger/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div>
            <h3 className="font-semibold text-foreground">Không thể xử lý yêu cầu</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-mutedText">
              {state.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'hint') {
    return (
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-warning/25 bg-warning/10 text-warning">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-warning">Gợi ý AI</p>
            <h3 className="font-semibold text-foreground">
              Gợi ý cấp {state.result.hintLevel ?? 1}
            </h3>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-warning/20 bg-warning/[0.07] p-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
            {state.result.hint}
          </p>
        </div>
        {state.result.nextAction ? (
          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-mutedText">
            <Play className="mt-1 h-4 w-4 shrink-0 text-secondary" />
            <span>
              <strong className="text-foreground">Bước tiếp theo:</strong> {state.result.nextAction}
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  const { result } = state;
  const accepted = isAcceptedVerdict(result.verdict);
  const verdict = verdictPresentation(result.verdict);
  const Icon = accepted ? CheckCircle2 : XCircle;
  const progress = result.totalTests
    ? Math.min(100, Math.round((result.passedTests / result.totalTests) * 100))
    : 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg border',
              accepted
                ? 'border-success/25 bg-success/10 text-success'
                : 'border-danger/25 bg-danger/10 text-danger',
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase text-mutedText">
              {state.action === 'submit' ? 'Kết quả nộp bài' : 'Kết quả chạy thử'}
            </p>
            <h3 className={cn('text-lg font-semibold', accepted ? 'text-success' : 'text-danger')}>
              {verdict.label}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-mutedText">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <Clock3 className="h-3.5 w-3.5 text-secondary" />
            {formatRuntime(result.runtimeMs)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <MemoryStick className="h-3.5 w-3.5 text-secondary" />
            {formatMemory(result.memoryKb)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-mutedText">{verdict.description}</p>

      <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.025] p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-foreground">Test đã vượt qua</span>
          <strong className={accepted ? 'text-success' : 'text-warning'}>
            {result.passedTests}/{result.totalTests}
          </strong>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className={cn('h-full rounded-full', accepted ? 'bg-success' : 'bg-warning')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {result.errorMessage ? (
        <div className="mt-4 rounded-lg border border-danger/20 bg-danger/[0.08] p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-danger">
            <AlertTriangle className="h-4 w-4" />
            Chi tiết lỗi
          </p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-6 text-foreground/85">
            {humanizeError(result.errorMessage)}
          </pre>
        </div>
      ) : null}

      {result.publicResults.length ? (
        <div className="mt-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Chi tiết test case</h4>
          {result.publicResults.map((test, index) => (
            <TestCaseResult key={`${test.input}-${index}`} test={test} index={index} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.025] p-3 text-sm leading-6 text-mutedText">
          {state.action === 'submit'
            ? 'Bài đã được chấm bằng test ẩn. Nội dung test ẩn không được hiển thị để bảo đảm công bằng.'
            : 'Máy chấm chưa trả về chi tiết test mẫu cho lần chạy này.'}
        </div>
      )}
    </div>
  );
}

function TestCaseResult({ test, index }: { test: JudgeTestResult; index: number }) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border',
        test.passed ? 'border-success/20 bg-success/[0.045]' : 'border-danger/20 bg-danger/[0.045]',
      )}
    >
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
        <span className="text-sm font-semibold text-foreground">Test #{index + 1}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            test.passed ? 'bg-success/12 text-success' : 'bg-danger/12 text-danger',
          )}
        >
          {test.passed ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <XCircle className="h-3.5 w-3.5" />
          )}
          {test.passed ? 'Đạt' : 'Chưa đạt'}
        </span>
      </div>
      <div className="grid gap-px bg-white/8 md:grid-cols-3">
        <TestValue label="Input" value={test.input} />
        <TestValue label="Kết quả mong đợi" value={test.expectedOutput} />
        <TestValue
          label="Output của bạn"
          value={test.actualOutput || '(không có output)'}
          tone={test.passed ? 'success' : 'danger'}
        />
      </div>
    </section>
  );
}

function TestValue({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'success' | 'danger';
}) {
  return (
    <div className="min-w-0 bg-[#0f1928]/75 p-3">
      <p className="text-[11px] font-semibold uppercase text-mutedText">{label}</p>
      <pre
        className={cn(
          'mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-foreground',
          tone === 'success' && 'text-success',
          tone === 'danger' && 'text-danger',
        )}
      >
        {value}
      </pre>
    </div>
  );
}

function buildLanguageDrafts(starterCode?: Record<string, string> | string) {
  return languageOptions.reduce<Record<CodeLanguage, string>>(
    (drafts, option) => {
      drafts[option.value] =
        findStarter(starterCode, option.value) ?? fallbackStarters[option.value];
      return drafts;
    },
    { ...fallbackStarters },
  );
}

function findStarter(
  starterCode: Record<string, string> | string | undefined,
  language: CodeLanguage,
) {
  if (typeof starterCode === 'string') {
    return language === 'JAVASCRIPT' ? starterCode : undefined;
  }
  if (!starterCode) return undefined;
  const match = Object.entries(starterCode).find(([key]) => key.toUpperCase() === language);
  return match?.[1]?.trim() ? match[1] : undefined;
}

function normalizeJudgeResult(value: unknown): JudgeResult | null {
  const record = asRecord(value);
  const nested = asRecord(record?.result);
  const source = typeof nested?.verdict === 'string' ? nested : record;
  if (!source || typeof source.verdict !== 'string') return null;

  const publicResults = Array.isArray(source.publicResults)
    ? source.publicResults
        .map(normalizeTestResult)
        .filter((item): item is JudgeTestResult => Boolean(item))
    : [];

  return {
    verdict: source.verdict,
    runtimeMs: finiteNumber(source.runtimeMs),
    memoryKb: finiteNumber(source.memoryKb),
    passedTests: finiteNumber(source.passedTests),
    totalTests: finiteNumber(source.totalTests),
    errorMessage:
      typeof source.errorMessage === 'string' && source.errorMessage.trim()
        ? source.errorMessage
        : source.verdict === 'INTERNAL_ERROR'
          ? 'Máy chấm gặp lỗi nội bộ và chưa thể thực thi bài code.'
          : undefined,
    publicResults,
  };
}

function normalizeTestResult(value: unknown): JudgeTestResult | null {
  const record = asRecord(value);
  if (!record) return null;
  return {
    input: stringValue(record.input),
    expectedOutput: stringValue(record.expectedOutput),
    actualOutput: stringValue(record.actualOutput),
    passed: record.passed === true,
  };
}

function normalizeHintResult(value: unknown): HintResult | null {
  const record = asRecord(value);
  if (!record || typeof record.hint !== 'string' || !record.hint.trim()) return null;
  return {
    hint: record.hint,
    hintLevel: finiteNumber(record.hintLevel) || undefined,
    nextAction: typeof record.nextAction === 'string' ? record.nextAction : undefined,
    revealsSolution: record.revealsSolution === true,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function finiteNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function extractWallet(value: unknown): WalletSummary | null {
  const record = asRecord(value);
  if (!record) return null;
  if (isWallet(record.wallet)) return record.wallet;
  const access = asRecord(record.access) ?? asRecord(asRecord(record.result)?.access);
  return isWallet(access?.wallet) ? access.wallet : null;
}

function isWallet(value: unknown): value is WalletSummary {
  return value !== null && typeof value === 'object' && 'balance' in value && 'currency' in value;
}

function extractVerdict(value: unknown) {
  const record = asRecord(value);
  if (!record) return undefined;
  if (typeof record.verdict === 'string') return record.verdict;
  const result = asRecord(record.result);
  if (typeof result?.verdict === 'string') return result.verdict;
  const submission = asRecord(record.submission);
  return typeof submission?.verdict === 'string' ? submission.verdict : undefined;
}

function isAcceptedVerdict(value?: string) {
  return Boolean(value && /accepted|correct|pass/i.test(value));
}

function verdictPresentation(verdict: string) {
  const presentations: Record<string, { label: string; description: string }> = {
    ACCEPTED: {
      label: 'Chính xác',
      description: 'Output của bạn khớp với kết quả mong đợi của toàn bộ test đã chấm.',
    },
    WRONG_ANSWER: {
      label: 'Sai kết quả',
      description:
        'Code đã chạy nhưng có ít nhất một output chưa khớp. Hãy xem test case bên dưới.',
    },
    COMPILATION_ERROR: {
      label: 'Lỗi biên dịch',
      description: 'Mã nguồn chưa biên dịch được. Kiểm tra cú pháp và nội dung lỗi bên dưới.',
    },
    RUNTIME_ERROR: {
      label: 'Lỗi khi chạy',
      description: 'Chương trình đã dừng bất thường trong lúc xử lý test case.',
    },
    TIME_LIMIT_EXCEEDED: {
      label: 'Quá thời gian',
      description: 'Chương trình chạy lâu hơn giới hạn của đề bài. Hãy tối ưu thuật toán.',
    },
    INTERNAL_ERROR: {
      label: 'Lỗi máy chấm',
      description:
        'Hệ thống chấm code đang gặp sự cố. Đây không nhất thiết là lỗi trong bài của bạn.',
    },
  };
  return (
    presentations[verdict] ?? {
      label: verdict.replaceAll('_', ' '),
      description: 'Máy chấm đã hoàn tất xử lý bài code.',
    }
  );
}

function humanizeError(message: string) {
  if (/JUDGE0_BASE_URL is not configured/i.test(message)) {
    return 'Máy chấm code chưa được cấu hình trên máy chủ. Quản trị viên cần kết nối Judge0 trước khi chạy bài.';
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return 'Không thể kết nối tới máy chủ chấm code. Kiểm tra kết nối mạng rồi thử lại.';
  }
  return message;
}

function formatRuntime(value: number) {
  return value > 0 ? `${value.toLocaleString('vi-VN')} ms` : 'Chưa có thời gian';
}

function formatMemory(value: number) {
  if (value <= 0) return 'Chưa có bộ nhớ';
  if (value >= 1024) return `${(value / 1024).toFixed(1)} MB`;
  return `${value.toLocaleString('vi-VN')} KB`;
}

function buildJudgeSummary(result: JudgeResult) {
  const presentation = verdictPresentation(result.verdict);
  const tests = result.publicResults
    .map(
      (test, index) =>
        `Test ${index + 1}: ${test.passed ? 'đạt' : 'chưa đạt'}; input=${test.input}; expected=${test.expectedOutput}; actual=${test.actualOutput || '(trống)'}`,
    )
    .join('\n');
  return `${presentation.label}. Đạt ${result.passedTests}/${result.totalTests} test.${result.errorMessage ? ` Lỗi: ${result.errorMessage}` : ''}${tests ? `\n${tests}` : ''}`;
}

function buildHintSummary(result: HintResult) {
  return `Gợi ý cấp ${result.hintLevel ?? 1}: ${result.hint}${result.nextAction ? ` Bước tiếp theo: ${result.nextAction}` : ''}`;
}
