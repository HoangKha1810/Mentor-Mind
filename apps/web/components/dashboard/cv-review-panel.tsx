'use client';

import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Loader2,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { apiFetch, authHeaders, uploadFile } from '@/lib/api';
import { CvReview, FileAsset } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { excerpt, publishLearningAssistantContext } from '@/lib/learning-assistant-context';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard } from './live-common';

export function CvReviewPanel() {
  const query = useLiveQuery<CvReview[]>('/ai/cv-review/me', { auth: true });
  const [message, setMessage] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const analysisLockRef = useRef(false);
  const [draftContext, setDraftContext] = useState({
    targetRole: '',
    cvText: '',
    jdText: '',
    githubUrl: '',
    portfolioUrl: '',
    completed: false,
    latestScore: undefined as number | undefined,
  });
  const latestReview = query.data?.[0];

  useEffect(() => {
    const hasDraft =
      draftContext.targetRole ||
      draftContext.cvText ||
      draftContext.jdText ||
      draftContext.githubUrl ||
      draftContext.portfolioUrl;
    if (!hasDraft && !latestReview) return;

    const timer = window.setTimeout(() => {
      publishLearningAssistantContext({
        surface: 'cv',
        source: 'cv-review',
        title: draftContext.targetRole || latestReview?.targetRole || 'Sửa CV',
        summary:
          draftContext.cvText || draftContext.jdText
            ? excerpt(`${draftContext.cvText} ${draftContext.jdText}`, 220)
            : 'Trợ lý đang theo dõi CV, JD và kết quả phân tích gần nhất.',
        cv: {
          targetRole: draftContext.targetRole || latestReview?.targetRole,
          cvExcerpt: draftContext.cvText,
          jdExcerpt: draftContext.jdText,
          githubUrl: draftContext.githubUrl,
          portfolioUrl: draftContext.portfolioUrl,
          latestScore: draftContext.latestScore ?? latestReview?.overallScore,
          completed: draftContext.completed,
        },
        completion: draftContext.completed
          ? {
              kind: 'cv',
              label:
                `Phân tích CV ${draftContext.targetRole || latestReview?.targetRole || ''}`.trim(),
              query: [
                draftContext.targetRole || latestReview?.targetRole,
                'cv improvement interview preparation',
              ]
                .filter(Boolean)
                .join(' '),
              score: draftContext.latestScore ?? latestReview?.overallScore,
              occurredAt: new Date().toISOString(),
            }
          : undefined,
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [draftContext, latestReview]);

  function updateDraftContext(event: FormEvent<HTMLFormElement>) {
    const form = new FormData(event.currentTarget);
    setDraftContext((current) => ({
      ...current,
      completed: false,
      targetRole: String(form.get('targetRole') ?? ''),
      cvText: String(form.get('cvText') ?? ''),
      jdText: String(form.get('jdText') ?? ''),
      githubUrl: String(form.get('githubUrl') ?? ''),
      portfolioUrl: String(form.get('portfolioUrl') ?? ''),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (analysisLockRef.current) return;

    analysisLockRef.current = true;
    setAnalyzing(true);
    setMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const cvFile = firstFile(form.get('cvFile'));
    const jdFile = firstFile(form.get('jdFile'));
    try {
      const [cvAsset, jdAsset] = await Promise.all([
        cvFile ? uploadFile<FileAsset>('/files', cvFile) : Promise.resolve(undefined),
        jdFile ? uploadFile<FileAsset>('/files', jdFile) : Promise.resolve(undefined),
      ]);
      const review = await apiFetch<CvReview>('/ai/cv-review', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          cvAssetId: cvAsset?.id,
          jdAssetId: jdAsset?.id,
          cvText: empty(form.get('cvText')),
          jdText: empty(form.get('jdText')),
          targetRole: form.get('targetRole') || 'Software Developer',
          portfolioUrl: empty(form.get('portfolioUrl')),
          githubUrl: empty(form.get('githubUrl')),
        }),
      });
      setDraftContext((current) => ({
        ...current,
        completed: true,
        latestScore: review.overallScore,
      }));
      setMessage('Đã tạo phân tích CV mới.');
      formElement.reset();
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không phân tích được CV');
    } finally {
      analysisLockRef.current = false;
      setAnalyzing(false);
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;

  return (
    <div className="space-y-5">
      <section className="dashboard-surface overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-soft">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <ClipboardCheck className="h-3.5 w-3.5" />
              ATS + JD + context học viên
            </div>
            <CardHeader className="mb-0 mt-4">
              <CardTitle className="text-2xl">Sửa CV bằng AI theo mục tiêu ứng tuyển</CardTitle>
              <CardDescription>
                Upload PDF/DOC/DOCX hoặc dán nội dung. Kết quả phân tích sẽ được lưu vào context
                riêng để trợ lý AI tư vấn chính xác hơn.
              </CardDescription>
            </CardHeader>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <WorkflowStep
              icon={<UploadCloud className="h-4 w-4" />}
              title="1. Tải CV/JD"
              text="File hoặc nội dung dán tay."
            />
            <WorkflowStep
              icon={<Brain className="h-4 w-4" />}
              title="2. AI phân tích"
              text="ATS, keyword, rủi ro phỏng vấn."
            />
            <WorkflowStep
              icon={<Sparkles className="h-4 w-4" />}
              title="3. Kế hoạch sửa"
              text="Bullet, dự án, lộ trình tiếp."
            />
          </div>
        </div>
      </section>

      <Card>
        <form onSubmit={submit} onChange={updateDraftContext} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="targetRole" placeholder="Vai trò mục tiêu" required />
            <Input name="githubUrl" placeholder="GitHub URL" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <FilePicker
              name="cvFile"
              label="Tải CV lên"
              description="Hỗ trợ PDF, DOCX, DOC, TXT, MD, RTF tối đa 10MB."
            />
            <FilePicker
              name="jdFile"
              label="Tải JD lên nếu có"
              description="Có thể bỏ trống nếu bạn chỉ muốn phân tích CV tổng quát."
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Textarea
              name="cvText"
              placeholder="Hoặc dán nội dung CV của bạn tại đây"
              className="min-h-44"
            />
            <Textarea
              name="jdText"
              placeholder="Dán JD hoặc mô tả công việc"
              className="min-h-44"
            />
          </div>
          <Input name="portfolioUrl" placeholder="Portfolio URL" />
          <p className="text-xs leading-5 text-mutedText">
            Nếu bạn vừa upload file vừa dán text, hệ thống sẽ gộp cả hai để AI phân tích đầy đủ hơn.
          </p>
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={analyzing} aria-busy={analyzing}>
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {analyzing ? 'Đang phân tích...' : 'Phân tích CV'}
            </Button>
            <span className="text-xs leading-5 text-mutedText">
              Sau khi phân tích, trợ lý AI có thể dùng kết quả này khi bạn chat về lộ trình, phỏng
              vấn và mức lương.
            </span>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Lịch sử phân tích</h2>
          <p className="mt-1 text-sm text-mutedText">
            Kết quả được lưu theo tài khoản để bạn theo dõi tiến bộ CV.
          </p>
        </div>
        {query.loading ? <LoadingCard label="Đang tải lịch sử phân tích CV..." /> : null}
        {query.error ? <ErrorCard message={query.error} onRetry={query.reload} /> : null}
        {!query.loading && !query.error && query.data?.length === 0 ? (
          <EmptyState
            title="Chưa có phân tích CV"
            description="Sau khi gửi CV/JD, kết quả phân tích theo tài khoản sẽ xuất hiện tại đây."
          />
        ) : null}
        <div className="grid gap-4 xl:grid-cols-2">
          {query.data?.map((review) => (
            <CvReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilePicker({
  name,
  label,
  description,
}: {
  name: string;
  label: string;
  description: string;
}) {
  return (
    <label className="block rounded-xl border border-dashed border-white/14 bg-white/[0.035] p-4 transition hover:border-success/50 hover:bg-white/[0.055]">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
          <UploadCloud className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs leading-5 text-mutedText">{description}</p>
        </div>
      </div>
      <input
        name={name}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.md,.markdown,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,application/rtf"
        className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-success file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-success/90"
      />
    </label>
  );
}

function CvReviewCard({ review }: { review: CvReview }) {
  const result = normalizeCvResult(review.result);
  const score = Math.max(0, Math.min(Number(review.overallScore ?? 0), 100));
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-secondary" />
          <div>
            <p className="font-medium text-white">Điểm tổng quan: {review.overallScore}/100</p>
            <p className="mt-1 text-xs text-mutedText">{formatDateTime(review.createdAt)}</p>
          </div>
        </div>
        {review.cvAssetId ? (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-mutedText">
            Có file CV
          </span>
        ) : null}
      </div>
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-white">Độ phù hợp tổng quan</span>
          <span className="font-semibold text-secondary">{score}/100</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#f59e0b,#57b846,#00d4ff)] transition-transform duration-500"
            style={{ transform: `scaleX(${score / 100})` }}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ResultList
          title="Điểm mạnh"
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          items={result.strengths}
        />
        <ResultList
          title="Cần sửa"
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          items={result.weaknesses}
        />
      </div>

      <ResultList title="Keyword còn thiếu" items={result.missingKeywords} className="mt-4" />
      <ResultList
        title="Gợi ý cải thiện dự án"
        items={result.projectSuggestions}
        className="mt-4"
      />
      <ResultList title="Bullet nên viết lại" items={result.betterBulletPoints} className="mt-4" />
      <ResultList title="Rủi ro khi phỏng vấn" items={result.interviewRiskAreas} className="mt-4" />

      <div className="mt-4 rounded-lg border border-white/8 bg-secondary/8 p-4">
        <p className="text-sm font-semibold text-white">Đề xuất tiếp theo</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Gói phù hợp: {result.recommendedTutoringPackage}
        </p>
        <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
          {result.recommendedRoadmapItems.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function WorkflowStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/12 text-secondary">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-mutedText">{text}</p>
    </div>
  );
}

function ResultList({
  title,
  items,
  icon,
  className,
}: {
  title: string;
  items: string[];
  icon?: ReactNode;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </div>
      <ul className="space-y-1 rounded-lg border border-white/8 bg-white/[0.03] p-4 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

type CvReviewResult = {
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  projectSuggestions: string[];
  betterBulletPoints: string[];
  interviewRiskAreas: string[];
  recommendedTutoringPackage: string;
  recommendedRoadmapItems: string[];
};

function normalizeCvResult(value: unknown): CvReviewResult {
  const result = (value && typeof value === 'object' ? value : {}) as Partial<CvReviewResult>;
  return {
    strengths: toStringList(result.strengths),
    weaknesses: toStringList(result.weaknesses),
    missingKeywords: toStringList(result.missingKeywords),
    projectSuggestions: toStringList(result.projectSuggestions),
    betterBulletPoints: toStringList(result.betterBulletPoints),
    interviewRiskAreas: toStringList(result.interviewRiskAreas),
    recommendedTutoringPackage: String(result.recommendedTutoringPackage ?? 'Chưa có đề xuất'),
    recommendedRoadmapItems: toStringList(result.recommendedRoadmapItems),
  };
}

function toStringList(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function firstFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : undefined;
}

function empty(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : undefined;
}
