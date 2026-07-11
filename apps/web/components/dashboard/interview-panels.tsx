'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Headphones,
  MessageSquarePlus,
  Mic,
  MicOff,
  Send,
  SquareCheckBig,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, authHeaders } from '@/lib/api';
import { InterviewQuestion, InterviewSession } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { excerpt, publishLearningAssistantContext } from '@/lib/learning-assistant-context';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

type CreateSessionResponse = {
  session: InterviewSession;
  suggestedQuestions: InterviewQuestion[];
};

type SpeechRecognitionAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function InterviewOverviewPanel() {
  const query = useLiveQuery<InterviewSession[]>('/ai/interview/sessions/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải phiên phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;

  const sessions = query.data ?? [];
  const latest = sessions.slice(0, 3);
  const completed = sessions.filter(
    (session) => session.status === 'COMPLETED' || session.completedAt,
  ).length;
  const averageScore = averageInterviewScore(sessions);
  const modes = [
    {
      mode: 'TECHNICAL',
      label: 'Phỏng vấn kỹ thuật',
      description: 'DSA, system thinking, kiến thức nền và cách giải thích trade-off.',
      accent: 'from-sky-500/35 via-cyan-500/18 to-emerald-500/16',
    },
    {
      mode: 'PROJECT_DEFENSE',
      label: 'Bảo vệ dự án',
      description: 'Giải thích kiến trúc, vai trò cá nhân, rủi ro và quyết định kỹ thuật.',
      accent: 'from-violet-500/35 via-indigo-500/20 to-sky-500/16',
    },
    {
      mode: 'ENGLISH',
      label: 'Phỏng vấn tiếng Anh',
      description: 'Luyện trả lời tự nhiên, rõ ý và đúng ngữ cảnh công việc.',
      accent: 'from-amber-500/30 via-orange-500/18 to-rose-500/18',
    },
  ];

  return (
    <div className="space-y-5">
      <section className="dashboard-surface overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-soft">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              <Headphones className="h-3.5 w-3.5" />
              Mock interview có chấm điểm
            </div>
            <CardHeader className="mb-0 mt-4">
              <CardTitle className="text-2xl">Luyện phỏng vấn theo phiên thật</CardTitle>
              <CardDescription>
                Chọn mode, trả lời bằng text hoặc voice, AI chấm từng câu và lưu lịch sử theo tài
                khoản.
              </CardDescription>
            </CardHeader>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <InterviewMetric
              icon={<MessageSquarePlus className="h-4 w-4" />}
              label="Tổng phiên"
              value={String(sessions.length)}
            />
            <InterviewMetric
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Hoàn tất"
              value={String(completed)}
            />
            <InterviewMetric
              icon={<BarChart3 className="h-4 w-4" />}
              label="Điểm TB"
              value={averageScore}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {modes.map((item) => (
          <Link
            key={item.mode}
            href={`/dashboard/interview/new?mode=${item.mode}`}
            className="group block"
          >
            <div
              className={`relative min-h-[15rem] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${item.accent} p-5 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-white/20`}
            >
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/14 bg-white/12 text-white">
                  <MessageSquarePlus className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.description}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-white">
                  Bắt đầu luyện
                  <Send className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!sessions.length ? (
        <EmptyState
          title="Chưa có phiên phỏng vấn"
          description="Tạo phiên đầu tiên để điểm số và phản hồi được lưu theo tài khoản."
          actionHref="/dashboard/interview/new"
          actionLabel="Bắt đầu phỏng vấn"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {latest.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}

export function NewInterviewForm({ initialMode = 'TECHNICAL' }: { initialMode?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await apiFetch<CreateSessionResponse>('/ai/interview/sessions', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          targetRole: form.get('targetRole'),
          level: form.get('level'),
          mode: form.get('mode'),
        }),
      });
      router.push(`/dashboard/interview/${response.session.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được phiên phỏng vấn');
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="mb-5 rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(109,93,254,0.28),rgba(0,212,255,0.12),rgba(87,184,70,0.10))] p-5">
        <CardHeader className="mb-0">
          <CardTitle className="text-2xl">Tạo phiên phỏng vấn mới</CardTitle>
          <CardDescription>
            Session sẽ được lưu trong tài khoản, các câu trả lời sau đó được AI chấm điểm và gợi ý
            cải thiện.
          </CardDescription>
        </CardHeader>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input name="targetRole" placeholder="Vai trò mục tiêu" required />
          <Input name="level" placeholder="Level: Intern, Junior..." required />
          <select
            name="mode"
            defaultValue={initialMode}
            className="h-11 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"
          >
            <option value="TECHNICAL">Kỹ thuật</option>
            <option value="BEHAVIORAL">Hành vi</option>
            <option value="HR">HR</option>
            <option value="PROJECT_DEFENSE">Bảo vệ dự án</option>
            <option value="ENGLISH">Tiếng Anh</option>
            <option value="MIXED">Tổng hợp</option>
          </select>
        </div>
        {message ? <p className="text-sm text-warning">{message}</p> : null}
        <Button>
          <MessageSquarePlus className="h-4 w-4" />
          Tạo và vào phiên
        </Button>
      </form>
    </Card>
  );
}

export function InterviewHistoryPanel() {
  const query = useLiveQuery<InterviewSession[]>('/ai/interview/sessions/me', { auth: true });

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải lịch sử phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        title="Chưa có lịch sử phỏng vấn"
        description="Tạo phiên phỏng vấn đầu tiên để lưu điểm, phản hồi và câu trả lời tốt hơn."
        actionHref="/dashboard/interview/new"
        actionLabel="Bắt đầu phỏng vấn"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {query.data.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

export function InterviewSessionPanel({ id }: { id: string }) {
  const query = useLiveQuery<InterviewSession>(`/ai/interview/sessions/${id}`, {
    auth: true,
    deps: [id],
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [message, setMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceLang, setVoiceLang] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answerDraft, setAnswerDraft] = useState('');
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const defaultQuestion = query.data
    ? (questions[query.data.answers?.length ?? 0]?.question ??
      questions[0]?.question ??
      `Hãy trình bày một kinh nghiệm quan trọng liên quan đến vị trí ${query.data.targetRole}.`)
    : '';

  useEffect(() => {
    async function loadQuestions() {
      if (!query.data) return;
      try {
        const params = new URLSearchParams({
          role: query.data.targetRole,
          level: query.data.level,
        });
        setQuestions(
          await apiFetch<InterviewQuestion[]>(`/interview-questions?${params.toString()}`),
        );
      } catch {
        setQuestions([]);
      }
    }
    void loadQuestions();
  }, [query.data]);

  useEffect(() => {
    setVoiceSupported(
      typeof window !== 'undefined' &&
        Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (defaultQuestion) {
      setCurrentQuestion(defaultQuestion);
    }
  }, [defaultQuestion]);

  useEffect(() => {
    if (!query.data) return;
    const timer = window.setTimeout(() => {
      publishInterviewContext();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query.data, currentQuestion, answerDraft]);

  function publishInterviewContext(completed = false) {
    if (!query.data) return;
    const isCompleted =
      completed || Boolean(query.data.completedAt) || query.data.status === 'COMPLETED';
    publishLearningAssistantContext({
      surface: 'interview',
      source: 'interview-session',
      title: query.data.targetRole,
      summary: excerpt(currentQuestion || defaultQuestion, 220),
      interview: {
        sessionId: query.data.id,
        targetRole: query.data.targetRole,
        level: query.data.level,
        mode: query.data.mode,
        status: query.data.status,
        currentQuestion: currentQuestion || defaultQuestion,
        answerDraft,
        answeredCount: query.data.answers?.length ?? 0,
        overallScore: query.data.overallScore,
        completed: isCompleted,
      },
      completion: isCompleted
        ? {
            kind: 'interview',
            label: `Phiên phỏng vấn ${query.data.targetRole}`,
            query: [query.data.targetRole, query.data.level, query.data.mode, 'interview practice']
              .filter(Boolean)
              .join(' '),
            score: query.data.overallScore,
            occurredAt: new Date().toISOString(),
          }
        : undefined,
    });
  }

  function appendTranscript(value: string) {
    const text = value.trim();
    if (!text) return;
    setAnswerDraft((current) => (current.trim() ? `${current.trim()} ${text}` : text));
  }

  function toggleVoiceInput() {
    if (!voiceSupported) {
      setVoiceMessage('Trình duyệt hiện tại chưa hỗ trợ nhập giọng nói.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceMessage('Đã dừng nghe.');
      return;
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = voiceLang;
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript ?? '';
        if (result?.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        appendTranscript(finalTranscript);
      }
      setVoiceMessage(
        interimTranscript ? `Đang nghe: ${interimTranscript.trim()}` : 'Đang nghe...',
      );
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(
        event.error ? `Không nhận được giọng nói: ${event.error}` : 'Không nhận được giọng nói.',
      );
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setVoiceMessage('Đang nghe...');
  }

  async function answer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const submittedQuestion = String(form.get('question') ?? '').trim();
    const questionId = questions.find((question) => question.question === submittedQuestion)?.id;
    try {
      await apiFetch(`/ai/interview/sessions/${id}/answer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          questionId,
          question: submittedQuestion,
          answer: String(form.get('answer') ?? ''),
        }),
      });
      formElement.reset();
      answerRef.current?.blur();
      setAnswerDraft('');
      recognitionRef.current?.stop();
      setVoiceMessage('');
      setMessage('Đã lưu câu trả lời và điểm đánh giá AI.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không gửi được câu trả lời');
    }
  }

  async function finish() {
    setMessage('');
    try {
      await apiFetch(`/ai/interview/sessions/${id}/finish`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã kết thúc phiên phỏng vấn.');
      publishInterviewContext(true);
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không kết thúc được phiên');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải phiên phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const answers = query.data.answers ?? [];
  const progressPercent = questions.length
    ? Math.min(Math.round((answers.length / questions.length) * 100), 100)
    : answers.length
      ? 100
      : 0;

  return (
    <div className="space-y-5">
      <section className="dashboard-surface overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-soft">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-secondary">Phiên đang luyện</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">{query.data.targetRole}</h2>
            <p className="mt-2 text-sm text-mutedText">
              {answers.length}/{Math.max(questions.length, answers.length, 1)} câu ·{' '}
              {formatInterviewMode(query.data.mode)} · {query.data.level}
            </p>
          </div>
          <div className="min-w-[14rem]">
            <div className="flex items-center justify-between text-xs text-mutedText">
              <span>Tiến độ</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#57b846,#00d4ff)] transition-transform duration-500"
                style={{ transform: `scaleX(${progressPercent / 100})` }}
              />
            </div>
          </div>
        </div>
        {questions.length ? (
          <div className="relative z-10 mt-5 flex gap-2 overflow-x-auto pb-1">
            {questions.slice(0, 24).map((question, index) => {
              const answered = index < answers.length;
              const active = (currentQuestion || defaultQuestion) === question.question;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setCurrentQuestion(question.question)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition active:scale-95 ${
                    active
                      ? 'border-secondary/40 bg-secondary/15 text-secondary'
                      : answered
                        ? 'border-success/35 bg-success/15 text-success'
                        : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20'
                  }`}
                  title={question.question}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <Card className="border-success/30">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{query.data.targetRole}</CardTitle>
            <CardDescription>
              {query.data.level} · {formatInterviewMode(query.data.mode)} ·{' '}
              {formatDateTime(query.data.createdAt)}
            </CardDescription>
          </CardHeader>
          <StatusBadge value={query.data.status} />
        </div>

        <form onSubmit={answer} className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Câu hỏi hiện tại</span>
              <Textarea
                name="question"
                value={currentQuestion || defaultQuestion}
                onChange={(event) => setCurrentQuestion(event.target.value)}
                required
                className="min-h-40 text-base leading-7"
              />
            </label>
            <label className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-200">Câu trả lời của bạn</span>
                <div className="flex flex-wrap items-center gap-2">
                  {voiceSupported ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      <Mic className="h-3.5 w-3.5" />
                      Voice sẵn sàng
                    </span>
                  ) : null}
                  <select
                    value={voiceLang}
                    onChange={(event) => setVoiceLang(event.target.value as 'vi-VN' | 'en-US')}
                    className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none"
                    disabled={isListening}
                  >
                    <option value="vi-VN">Tiếng Việt</option>
                    <option value="en-US">English</option>
                  </select>
                  <Button
                    type="button"
                    variant={isListening ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={toggleVoiceInput}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Dừng nghe' : 'Nhập bằng giọng nói'}
                  </Button>
                </div>
              </div>
              <Textarea
                ref={answerRef}
                name="answer"
                value={answerDraft}
                onChange={(event) => setAnswerDraft(event.target.value)}
                placeholder="Nhập câu trả lời có bối cảnh, hành động, kết quả và chi tiết kỹ thuật..."
                required
                className="min-h-40 text-base leading-7"
              />
              {voiceMessage ? (
                <span className="block text-xs text-secondary">{voiceMessage}</span>
              ) : null}
            </label>
          </div>
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button>
              <Send className="h-4 w-4" />
              Gửi câu trả lời
            </Button>
            <Button type="button" variant="secondary" onClick={finish}>
              <SquareCheckBig className="h-4 w-4" />
              Kết thúc phiên
            </Button>
          </div>
        </form>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Phản hồi đã lưu</h2>
            <p className="mt-1 text-sm text-mutedText">
              AI chấm từng câu trả lời và gợi ý cách cải thiện bằng Tiếng Việt.
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-mutedText">
            {answers.length} câu trả lời
          </span>
        </div>
        {answers.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {answers.map((item) => (
              <InterviewAnswerCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Chưa có câu trả lời"
            description="Gửi câu trả lời đầu tiên để AI chấm điểm và lưu lịch sử."
          />
        )}
      </section>
    </div>
  );
}

function InterviewMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-mutedText">
        <span className="text-secondary">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function averageInterviewScore(sessions: InterviewSession[]) {
  const scores = sessions
    .map((session) => session.overallScore)
    .filter((score): score is number => typeof score === 'number');
  if (!scores.length) return 'Chưa có';
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
}

function SessionCard({ session }: { session: InterviewSession }) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <CardHeader>
          <CardTitle>{session.targetRole}</CardTitle>
          <CardDescription>{formatDateTime(session.createdAt)}</CardDescription>
        </CardHeader>
        <StatusBadge value={session.status} />
      </div>
      <p className="text-sm text-mutedText">
        Chế độ: {formatInterviewMode(session.mode)} · Số câu trả lời: {session.answers?.length ?? 0}{' '}
        · Điểm: {session.overallScore ?? 'Chưa có'}
      </p>
      <Link href={`/dashboard/interview/${session.id}`} className="mt-4 inline-flex">
        <Button variant="outline">Mở phiên</Button>
      </Link>
    </Card>
  );
}

function InterviewAnswerCard({ item }: { item: NonNullable<InterviewSession['answers']>[number] }) {
  const feedback = normalizeInterviewFeedback(item.feedback, item.betterAnswer, item.score);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium leading-6 text-white">{item.question}</p>
          <p className="mt-1 text-xs text-mutedText">{formatDateTime(item.createdAt)}</p>
        </div>
        <span className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-sm font-semibold text-success">
          {feedback.score}/10
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <FeedbackList
          title="Điểm mạnh"
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
          items={feedback.strengths}
        />
        <FeedbackList
          title="Cần cải thiện"
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          items={feedback.weaknesses}
        />
      </div>

      <div className="mt-4 rounded-lg border border-white/8 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">Gợi ý trả lời tốt hơn</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{feedback.betterAnswer}</p>
        {feedback.nextPracticeSuggestion ? (
          <p className="mt-3 text-sm leading-6 text-secondary">
            Luyện tiếp: {feedback.nextPracticeSuggestion}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Object.entries(feedback.rubric).map(([key, value]) => (
          <div key={key} className="rounded-md border border-white/8 bg-black/15 p-3">
            <p className="text-xs text-mutedText">{rubricLabels[key] ?? key}</p>
            <p className="mt-1 text-lg font-semibold text-white">{value}/10</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FeedbackList({ title, icon, items }: { title: string; icon: ReactNode; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {title}
      </div>
      <ul className="space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item}>• {translateFeedbackText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

type InterviewFeedback = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  betterAnswer: string;
  nextPracticeSuggestion?: string;
  rubric: Record<string, number>;
};

function normalizeInterviewFeedback(
  feedback: unknown,
  betterAnswer?: string,
  score?: number,
): InterviewFeedback {
  const value = (
    feedback && typeof feedback === 'object' ? feedback : {}
  ) as Partial<InterviewFeedback>;
  return {
    score: Number(value.score ?? score ?? 0),
    strengths: Array.isArray(value.strengths) ? value.strengths.map(String) : [],
    weaknesses: Array.isArray(value.weaknesses) ? value.weaknesses.map(String) : [],
    betterAnswer: translateFeedbackText(
      String(value.betterAnswer ?? betterAnswer ?? 'Chưa có gợi ý.'),
    ),
    nextPracticeSuggestion: value.nextPracticeSuggestion
      ? translateFeedbackText(String(value.nextPracticeSuggestion))
      : undefined,
    rubric:
      value.rubric && typeof value.rubric === 'object'
        ? Object.fromEntries(Object.entries(value.rubric).map(([key, item]) => [key, Number(item)]))
        : {},
  };
}

const rubricLabels: Record<string, string> = {
  correctness: 'Độ đúng',
  clarity: 'Rõ ràng',
  structure: 'Cấu trúc',
  depth: 'Chiều sâu',
  relevance: 'Liên quan',
  confidence: 'Tự tin',
  examples: 'Ví dụ',
  communication: 'Giao tiếp',
  roleFit: 'Phù hợp vai trò',
};

const feedbackTranslations: Record<string, string> = {
  'Clear intent': 'Mục tiêu trả lời rõ ràng',
  'Relevant technical vocabulary': 'Có dùng từ vựng kỹ thuật liên quan',
  'Add a concrete example': 'Bổ sung ví dụ cụ thể',
  'State trade-offs more explicitly': 'Nêu rõ các đánh đổi kỹ thuật hơn',
  'A stronger answer would define the concept, explain why it matters, then connect it to a project example and trade-offs.':
    'Câu trả lời tốt hơn nên định nghĩa ý chính, giải thích vì sao nó quan trọng, rồi liên hệ với một dự án cụ thể và các đánh đổi đã cân nhắc.',
  'Practice answering with Situation, Action, Result and one technical detail.':
    'Luyện trả lời theo cấu trúc Tình huống, Hành động, Kết quả và thêm một chi tiết kỹ thuật.',
};

function translateFeedbackText(value: string) {
  return feedbackTranslations[value] ?? value;
}

function formatInterviewMode(value: string) {
  const labels: Record<string, string> = {
    TECHNICAL: 'Kỹ thuật',
    BEHAVIORAL: 'Hành vi',
    HR: 'HR',
    PROJECT_DEFENSE: 'Bảo vệ dự án',
    ENGLISH: 'Tiếng Anh',
    MIXED: 'Tổng hợp',
  };
  return labels[value] ?? value;
}
