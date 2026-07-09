'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  MessageSquarePlus,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { authHeaders, apiFetch } from '@/lib/api';
import { useLiveQuery } from '@/lib/live-query';
import {
  Account,
  AiChatResponse,
  AiContextUpdate,
  AiConversation,
  AiMessage,
} from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AuthRequiredCard, ErrorCard, LoadingCard } from '@/components/dashboard/live-common';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const suggestions = [
  'Mình muốn lương 20 triệu/tháng và làm ở Đà Nẵng, hãy nhớ giúp tôi.',
  'Tuần này tôi nên học gì để tiến gần hơn tới mục tiêu?',
  'Tôi rảnh 8 giờ/tuần, hãy điều chỉnh cách học cho thực tế.',
  'Dựa trên hồ sơ hiện tại, tôi còn thiếu gì để ứng tuyển?',
];

export default function AiAssistantPage() {
  const conversationsQuery = useLiveQuery<AiConversation[]>('/ai/chat/conversations', { auth: true });
  const accountQuery = useLiveQuery<Account>('/auth/me', { auth: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [localMessages, setLocalMessages] = useState<AiMessage[] | null>(null);
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const conversations = conversationsQuery.data ?? [];
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId);
  const messages = localMessages ?? selectedConversation?.messages ?? [];

  useEffect(() => {
    if (!selectedId && conversations[0]) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages.length, sending]);

  const contextItems = useMemo(() => buildContextItems(accountQuery.data), [accountQuery.data]);
  const personalContext = accountQuery.data?.studentProfile?.personalContext ?? {};

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    const baseMessages = localMessages ?? selectedConversation?.messages ?? [];
    const now = new Date().toISOString();
    const optimisticUser: AiMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: message,
      createdAt: now,
    };
    const pendingAssistant: AiMessage = {
      id: `assistant-pending-${Date.now()}`,
      role: 'ASSISTANT',
      content: 'Đang suy nghĩ...',
      createdAt: now,
      pending: true,
    };

    setDraft('');
    setSending(true);
    setLocalMessages([...baseMessages, optimisticUser, pendingAssistant]);

    try {
      const result = await apiFetch<AiChatResponse>('/ai/chat', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          message,
          conversationId: selectedConversation?.id,
        }),
      });

      const finalMessages: AiMessage[] = [
        ...baseMessages,
        { ...optimisticUser, conversationId: result.conversationId },
        {
          id: `assistant-${Date.now()}`,
          conversationId: result.conversationId,
          role: 'ASSISTANT',
          content: result.message,
          metadata: { contextUpdates: result.contextUpdates },
          createdAt: new Date().toISOString(),
        },
      ];
      setSelectedId(result.conversationId);
      setLocalMessages(finalMessages);
      conversationsQuery.reload();
      accountQuery.reload();
    } catch (error) {
      setLocalMessages([
        ...baseMessages,
        optimisticUser,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'ASSISTANT',
          content: error instanceof Error ? error.message : 'Không thể gửi tin nhắn tới trợ lý AI.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function selectConversation(id: string) {
    setSelectedId(id);
    setLocalMessages(null);
  }

  function startNewConversation() {
    setSelectedId(null);
    setLocalMessages([]);
    setDraft('');
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  if (conversationsQuery.unauthenticated || accountQuery.unauthenticated) {
    return (
      <DashboardShell
        title="Trợ lý học tập AI"
        subtitle="Chat với trợ lý cá nhân hóa theo hồ sơ, lộ trình và lịch sử luyện tập của bạn."
      >
        <AuthRequiredCard />
      </DashboardShell>
    );
  }

  if ((conversationsQuery.loading && !conversationsQuery.data) || (accountQuery.loading && !accountQuery.data)) {
    return (
      <DashboardShell
        title="Trợ lý học tập AI"
        subtitle="Chat với trợ lý cá nhân hóa theo hồ sơ, lộ trình và lịch sử luyện tập của bạn."
      >
        <LoadingCard label="Đang mở trợ lý học tập AI..." />
      </DashboardShell>
    );
  }

  if (conversationsQuery.error) {
    return (
      <DashboardShell
        title="Trợ lý học tập AI"
        subtitle="Chat với trợ lý cá nhân hóa theo hồ sơ, lộ trình và lịch sử luyện tập của bạn."
      >
        <ErrorCard message={conversationsQuery.error} onRetry={conversationsQuery.reload} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Trợ lý học tập AI"
      subtitle="Chat như với mentor cá nhân. Khi bạn chia sẻ mục tiêu, lương kỳ vọng, địa điểm hoặc lịch rảnh, trợ lý sẽ ghi nhớ vào ngữ cảnh riêng của bạn."
    >
      <div className="grid min-h-[calc(100vh-12rem)] gap-4 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="glass hidden overflow-hidden rounded-xl xl:flex xl:flex-col">
          <div className="border-b border-white/10 p-4">
            <Button className="w-full" onClick={startNewConversation}>
              <MessageSquarePlus className="h-4 w-4" />
              Cuộc chat mới
            </Button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {conversations.length ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition active:scale-[0.99]',
                    selectedId === conversation.id
                      ? 'border-secondary/35 bg-secondary/12 text-white'
                      : 'border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/14 hover:bg-white/[0.06]',
                  )}
                >
                  <div className="line-clamp-2 text-sm font-semibold">{conversation.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-mutedText">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDateTime(conversation.updatedAt)}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-white/8 bg-white/[0.025] p-3 text-sm leading-6 text-mutedText">
                Chưa có cuộc chat nào. Bắt đầu bằng một câu hỏi hoặc chia sẻ mục tiêu của bạn.
              </div>
            )}
          </div>
        </aside>

        <section className="glass flex min-h-[38rem] flex-col overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-secondary">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {selectedConversation?.title ?? 'Cuộc trò chuyện mới'}
                </p>
                <p className="text-xs text-mutedText">Có thể ghi nhớ context học tập và nghề nghiệp</p>
              </div>
            </div>
            <button
              type="button"
              onClick={startNewConversation}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 text-xs font-semibold text-slate-100 transition hover:border-secondary/35 hover:bg-secondary/10 xl:hidden"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Chat mới
            </button>
          </div>

          <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length ? (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.map((message, index) => (
                  <ChatMessage key={message.id ?? `${message.role}-${index}`} message={message} />
                ))}
              </div>
            ) : (
              <WelcomeState onPickSuggestion={setDraft} />
            )}
          </div>

          <div className="border-t border-white/10 bg-background/70 p-3 backdrop-blur-xl sm:p-4">
            <form ref={formRef} onSubmit={submit} className="mx-auto max-w-3xl">
              <div className="rounded-2xl border border-white/12 bg-white/[0.045] p-2 shadow-soft transition focus-within:border-secondary/35">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Nhắn cho trợ lý: mục tiêu, mức lương, địa điểm, lịch rảnh, bài code đang vướng..."
                  className="min-h-20 resize-none border-0 bg-transparent p-3 focus:ring-0"
                  required
                />
                <div className="flex items-center justify-between gap-3 px-2 pb-1">
                  <p className="text-xs text-mutedText">Enter để gửi, Shift + Enter để xuống dòng</p>
                  <Button size="icon" disabled={sending || !draft.trim()} aria-label="Gửi tin nhắn">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <aside className="glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-secondary" />
            <h2 className="text-base font-semibold text-white">Ngữ cảnh đã nhớ</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-mutedText">
            Các thông tin này được dùng để cá nhân hóa câu trả lời, lộ trình và gợi ý học tập.
          </p>

          <div className="mt-4 space-y-2">
            {contextItems.length ? (
              contextItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/8 bg-white/[0.035] p-3">
                  <div className="text-xs text-mutedText">{item.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-100">{item.value}</div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/14 bg-white/[0.025] p-3 text-sm leading-6 text-mutedText">
                Chưa có nhiều context. Hãy thử nói: “Mình muốn làm Backend ở TP.HCM, lương kỳ vọng 18 triệu”.
              </div>
            )}
          </div>

          {Object.keys(personalContext).length ? (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-mutedText">
                Ghi nhớ mở rộng
              </p>
              <div className="space-y-2">
                {Object.entries(personalContext)
                  .slice(0, 8)
                  .map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-black/18 px-3 py-2">
                      <div className="text-[11px] text-mutedText">{formatContextKey(key)}</div>
                      <div className="mt-1 break-words text-xs leading-5 text-slate-200">
                        {formatContextValue(value)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </DashboardShell>
  );
}

function WelcomeState({ onPickSuggestion }: { onPickSuggestion: (value: string) => void }) {
  return (
    <div className="mx-auto flex min-h-[24rem] max-w-3xl flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/12 text-secondary shadow-[0_0_40px_rgba(0,212,255,0.16)]">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-white">Hôm nay mình hỗ trợ gì cho bạn?</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-mutedText">
        Bạn có thể hỏi về lộ trình, bài code, CV, phỏng vấn hoặc chia sẻ thông tin cá nhân hóa như
        mức lương kỳ vọng, địa điểm làm việc, thời gian rảnh.
      </p>
      <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onPickSuggestion(suggestion)}
            className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-left text-sm leading-6 text-slate-200 transition hover:border-secondary/35 hover:bg-secondary/10"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: AiMessage }) {
  const isUser = message.role === 'USER';
  const contextUpdates = message.metadata?.contextUpdates;
  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/12 text-secondary">
          <Bot className="h-4 w-4" />
        </div>
      ) : null}
      <div className={cn('max-w-[min(100%,42rem)]', isUser ? 'order-first' : '')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-7 shadow-soft',
            isUser
              ? 'rounded-br-md bg-[linear-gradient(135deg,#57b846,#18c6a6)] text-white'
              : 'rounded-bl-md border border-white/10 bg-white/[0.045] text-slate-100',
          )}
        >
          {message.pending ? (
            <span className="inline-flex items-center gap-2 text-mutedText">
              <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
              Đang suy nghĩ...
            </span>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        {!isUser && contextUpdates?.rememberedFacts?.length ? (
          <RememberedFacts updates={contextUpdates} />
        ) : null}
      </div>
      {isUser ? (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-slate-200">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

function RememberedFacts({ updates }: { updates: AiContextUpdate }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {updates.rememberedFacts.map((fact) => (
        <span
          key={`${fact.label}-${fact.value}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-medium text-green-100"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã nhớ {fact.label}: {fact.value}
        </span>
      ))}
    </div>
  );
}

function buildContextItems(account: Account | null) {
  const profile = account?.studentProfile;
  if (!profile) return [];
  return [
    ['Vai trò mục tiêu', profile.targetRole],
    ['Trình độ hiện tại', profile.currentLevel],
    ['Mức lương kỳ vọng', profile.expectedSalary],
    ['Địa điểm ưu tiên', profile.preferredLocation],
    ['Thời gian học', profile.weeklyHours ? `${profile.weeklyHours} giờ/tuần` : null],
    ['Ngân sách', profile.budgetRange],
    ['Cách học phù hợp', profile.learningStyle],
    ['Múi giờ', profile.timezone],
  ]
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({ label: String(label), value: String(value) }));
}

function formatContextKey(key: string) {
  const labels: Record<string, string> = {
    expectedSalary: 'Mức lương kỳ vọng',
    preferredLocation: 'Địa điểm ưu tiên',
    workMode: 'Hình thức làm việc',
    availability: 'Lịch rảnh',
    constraints: 'Ràng buộc',
    interests: 'Quan tâm',
    notes: 'Ghi chú',
    weeklyHours: 'Thời gian học',
    budgetRange: 'Ngân sách',
  };
  return labels[key] ?? key;
}

function formatContextValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatContextValue(item)).join(', ');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([key, entry]) => `${formatContextKey(key)}: ${formatContextValue(entry)}`)
      .join('; ');
  }
  return String(value ?? '');
}
