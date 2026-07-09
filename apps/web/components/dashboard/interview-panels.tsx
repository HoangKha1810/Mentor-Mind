'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquarePlus, Mic, MicOff, Send, SquareCheckBig } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiFetch, authHeaders } from '@/lib/api';
import { InterviewQuestion, InterviewSession } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
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

  const latest = query.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['TECHNICAL', 'Phỏng vấn kỹ thuật'],
          ['PROJECT_DEFENSE', 'Bảo vệ dự án'],
          ['ENGLISH', 'Phỏng vấn tiếng Anh'],
        ].map(([mode, label]) => (
          <Card key={mode}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Tạo phiên luyện tập, trả lời từng câu và nhận đánh giá AI.</CardDescription>
            </CardHeader>
            <Link href={`/dashboard/interview/new?mode=${mode}`}>
              <Button>
                <MessageSquarePlus className="h-4 w-4" />
                Bắt đầu
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {!query.data?.length ? (
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
    <Card>
      <CardHeader>
        <CardTitle>Tạo phiên phỏng vấn mới</CardTitle>
        <CardDescription>
          Session sẽ được lưu trong tài khoản, các câu trả lời sau đó được AI chấm điểm.
        </CardDescription>
      </CardHeader>
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
  const query = useLiveQuery<InterviewSession>(`/ai/interview/sessions/${id}`, { auth: true, deps: [id] });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [message, setMessage] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [voiceLang, setVoiceLang] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    async function loadQuestions() {
      if (!query.data) return;
      try {
        const params = new URLSearchParams({
          role: query.data.targetRole,
          level: query.data.level,
        });
        setQuestions(await apiFetch<InterviewQuestion[]>(`/interview-questions?${params.toString()}`));
      } catch {
        setQuestions([]);
      }
    }
    void loadQuestions();
  }, [query.data]);

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function appendTranscript(value: string) {
    const text = value.trim();
    if (!text || !answerRef.current) return;
    const current = answerRef.current.value.trim();
    answerRef.current.value = current ? `${current} ${text}` : text;
    answerRef.current.dispatchEvent(new Event('input', { bubbles: true }));
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
      setVoiceMessage(interimTranscript ? `Đang nghe: ${interimTranscript.trim()}` : 'Đang nghe...');
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      setVoiceMessage(event.error ? `Không nhận được giọng nói: ${event.error}` : 'Không nhận được giọng nói.');
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
    try {
      await apiFetch(`/ai/interview/sessions/${id}/answer`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          question: form.get('question'),
          answer: form.get('answer'),
        }),
      });
      formElement.reset();
      answerRef.current?.blur();
      if (answerRef.current) answerRef.current.value = '';
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
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không kết thúc được phiên');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải phiên phỏng vấn..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const defaultQuestion =
    questions[query.data.answers?.length ?? 0]?.question ??
    questions[0]?.question ??
    `Hãy trình bày một kinh nghiệm quan trọng liên quan đến vị trí ${query.data.targetRole}.`;

  const answers = query.data.answers ?? [];

  return (
    <div className="space-y-5">
      <Card className="border-success/30">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{query.data.targetRole}</CardTitle>
            <CardDescription>
              {query.data.level} · {formatInterviewMode(query.data.mode)} · {formatDateTime(query.data.createdAt)}
            </CardDescription>
          </CardHeader>
          <StatusBadge value={query.data.status} />
        </div>

        <form onSubmit={answer} className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Câu hỏi hiện tại</span>
              <Textarea name="question" defaultValue={defaultQuestion} required className="min-h-40 text-base leading-7" />
            </label>
            <label className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-200">Câu trả lời của bạn</span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={voiceLang}
                    onChange={(event) => setVoiceLang(event.target.value as 'vi-VN' | 'en-US')}
                    className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none"
                    disabled={isListening}
                  >
                    <option value="vi-VN">Tiếng Việt</option>
                    <option value="en-US">English</option>
                  </select>
                  <Button type="button" variant={isListening ? 'secondary' : 'outline'} size="sm" onClick={toggleVoiceInput}>
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {isListening ? 'Dừng nghe' : 'Nhập bằng giọng nói'}
                  </Button>
                </div>
              </div>
              <Textarea
                ref={answerRef}
                name="answer"
                placeholder="Nhập câu trả lời có bối cảnh, hành động, kết quả và chi tiết kỹ thuật..."
                required
                className="min-h-40 text-base leading-7"
              />
              {voiceMessage ? <span className="block text-xs text-secondary">{voiceMessage}</span> : null}
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
            <p className="mt-1 text-sm text-mutedText">AI chấm từng câu trả lời và gợi ý cách cải thiện bằng Tiếng Việt.</p>
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
        Chế độ: {formatInterviewMode(session.mode)} · Số câu trả lời: {session.answers?.length ?? 0} · Điểm:{' '}
        {session.overallScore ?? 'Chưa có'}
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
          <p className="mt-3 text-sm leading-6 text-secondary">Luyện tiếp: {feedback.nextPracticeSuggestion}</p>
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

function normalizeInterviewFeedback(feedback: unknown, betterAnswer?: string, score?: number): InterviewFeedback {
  const value = (feedback && typeof feedback === 'object' ? feedback : {}) as Partial<InterviewFeedback>;
  return {
    score: Number(value.score ?? score ?? 0),
    strengths: Array.isArray(value.strengths) ? value.strengths.map(String) : [],
    weaknesses: Array.isArray(value.weaknesses) ? value.weaknesses.map(String) : [],
    betterAnswer: translateFeedbackText(String(value.betterAnswer ?? betterAnswer ?? 'Chưa có gợi ý.')),
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
