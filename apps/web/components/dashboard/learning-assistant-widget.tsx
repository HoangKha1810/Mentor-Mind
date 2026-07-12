'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, ExternalLink, Lightbulb, Loader2, Route, Send, Sparkles, X } from 'lucide-react';
import { apiFetch, authHeaders, ensureAccessToken } from '@/lib/api';
import {
  excerpt,
  clearStoredLearningAssistantContexts,
  isLearningAssistantContextCurrent,
  LEARNING_ASSISTANT_CONTEXT_EVENT,
  LearningAssistantContextSnapshot,
  learningAssistantSurfaceForRoute,
  normalizeLearningAssistantRoute,
  readLatestPublishedLearningAssistantContext,
  readStoredLearningAssistantContext,
  storeLearningAssistantContext,
} from '@/lib/learning-assistant-context';
import { useLiveQuery } from '@/lib/live-query';
import {
  Account,
  AiChatResponse,
  AiMessage,
  CvReview,
  InterviewSession,
  ResourceItem,
} from '@/lib/domain-types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motionSpring } from '@/lib/motion-system';

const IDLE_TRIGGER_SECONDS = 40;
const NUDGE_COOLDOWN_MS = 5 * 60 * 1000;
const NUDGE_STORAGE_KEY = 'mentormind.learningAssistantLastNudgeAt';
const ASSISTANT_ICON_SRC = '/assistant/ai-assistant-bot.webp';
const AssistantMarkdownContent = dynamic(
  () => import('@/components/ui/markdown-content').then((module) => module.MarkdownContent),
  {
    ssr: false,
    loading: () => <span className="text-mutedText">Đang định dạng câu trả lời...</span>,
  },
);

type SearchResponse = {
  query: string;
  results: ResourceItem[];
};

type AssistantNudge = {
  id: string;
  title: string;
  body: string;
  action: 'hint' | 'resources' | 'roadmap' | 'chat';
  actionLabel: string;
};

type OwnedSurfaceContext = {
  snapshot: LearningAssistantContextSnapshot;
  ownerId: string | null;
};

function selectNewestContext(
  live: LearningAssistantContextSnapshot | null | undefined,
  stored: LearningAssistantContextSnapshot | null | undefined,
) {
  if (!live) return stored ?? null;
  if (!stored) return live;

  const liveUpdatedAt = Date.parse(live.updatedAt ?? '');
  const storedUpdatedAt = Date.parse(stored.updatedAt ?? '');
  return liveUpdatedAt >= storedUpdatedAt ? live : stored;
}

export function LearningAssistantWidget() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const accountQuery = useLiveQuery<Account>('/auth/me', { auth: true });
  const cvQuery = useLiveQuery<CvReview[]>('/ai/cv-review/me', { auth: true });
  const interviewQuery = useLiveQuery<InterviewSession[]>('/ai/interview/sessions/me', {
    auth: true,
  });
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [surfaceContext, setSurfaceContext] = useState<OwnedSurfaceContext | null>(null);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [nudge, setNudge] = useState<AssistantNudge | null>(null);
  const [dismissedNudgeId, setDismissedNudgeId] = useState<string | null>(null);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [resourceMessage, setResourceMessage] = useState('');
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastActivityAtRef = useRef(Date.now());
  const idleSecondsRef = useRef(0);
  const idleBucketRef = useRef(0);
  const panelRef = useRef<HTMLElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const previousRouteRef = useRef<string | null>(null);
  const previousAccountIdRef = useRef<string | null>(null);

  const accountId = accountQuery.data?.id ?? null;
  const latestCvReview = cvQuery.data?.[0];
  const latestInterview = interviewQuery.data?.[0];
  const activeContext = useMemo(
    () =>
      surfaceContext &&
      (surfaceContext.ownerId === null || surfaceContext.ownerId === accountId) &&
      isLearningAssistantContextCurrent(surfaceContext.snapshot, pathname)
        ? surfaceContext.snapshot
        : inferRouteContext(pathname),
    [accountId, pathname, surfaceContext],
  );
  const candidateNudge = useMemo(
    () => buildNudge(activeContext, idleSeconds, open),
    [activeContext, idleSeconds, open],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const routeKey = normalizeLearningAssistantRoute(pathname);
    const routeChanged = previousRouteRef.current !== null && previousRouteRef.current !== routeKey;
    const accountChanged =
      previousAccountIdRef.current !== null && previousAccountIdRef.current !== accountId;

    previousRouteRef.current = routeKey;
    previousAccountIdRef.current = accountId;

    if (routeChanged || accountChanged || accountQuery.unauthenticated) {
      setConversationId(undefined);
      setMessages([]);
      setResources([]);
      setResourceMessage('');
      setOpen(false);
    }
    setNudge(null);
    setDismissedNudgeId(null);
    lastActivityAtRef.current = Date.now();
    idleSecondsRef.current = 0;
    idleBucketRef.current = 0;
    setIdleSeconds(0);

    if (accountQuery.unauthenticated) {
      clearStoredLearningAssistantContexts();
      setSurfaceContext(null);
      return;
    }

    const liveContext = readLatestPublishedLearningAssistantContext(routeKey);
    const stored = accountId ? readStoredLearningAssistantContext(accountId, routeKey) : null;
    setSurfaceContext((current) => {
      const freshestContext = accountChanged ? stored : selectNewestContext(liveContext, stored);
      if (freshestContext) {
        return { snapshot: freshestContext, ownerId: accountId };
      }
      if (
        current &&
        isLearningAssistantContextCurrent(current.snapshot, routeKey) &&
        (current.ownerId === null || current.ownerId === accountId)
      ) {
        return { snapshot: current.snapshot, ownerId: accountId };
      }
      return null;
    });
  }, [accountId, accountQuery.unauthenticated, pathname]);

  useEffect(() => {
    if (
      accountId &&
      surfaceContext?.ownerId === accountId &&
      isLearningAssistantContextCurrent(surfaceContext.snapshot, pathname)
    ) {
      storeLearningAssistantContext(accountId, surfaceContext.snapshot);
    }
  }, [accountId, pathname, surfaceContext]);

  useEffect(() => {
    function handleContext(event: Event) {
      const detail = (event as CustomEvent<LearningAssistantContextSnapshot>).detail;
      if (!detail || !isLearningAssistantContextCurrent(detail, pathname)) return;
      setSurfaceContext({ snapshot: detail, ownerId: accountId });
      setNudge(null);
      if (detail.completion) {
        setDismissedNudgeId(null);
        setResourceMessage('');
        setResources([]);
      }
    }

    window.addEventListener(LEARNING_ASSISTANT_CONTEXT_EVENT, handleContext);
    return () => window.removeEventListener(LEARNING_ASSISTANT_CONTEXT_EVENT, handleContext);
  }, [accountId, pathname]);

  useEffect(() => {
    function markActivity() {
      lastActivityAtRef.current = Date.now();
      idleSecondsRef.current = 0;
      if (idleBucketRef.current !== 0) {
        idleBucketRef.current = 0;
        setIdleSeconds(0);
      }
    }

    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'scroll'];
    events.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true }),
    );
    window.addEventListener('input', markActivity, { passive: true, capture: true });
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const nextIdleSeconds = Math.floor((Date.now() - lastActivityAtRef.current) / 1000);
      idleSecondsRef.current = nextIdleSeconds;
      const nextBucket = nextIdleSeconds >= IDLE_TRIGGER_SECONDS ? IDLE_TRIGGER_SECONDS : 0;
      if (nextBucket === idleBucketRef.current) return;
      idleBucketRef.current = nextBucket;
      setIdleSeconds(nextBucket);
    }, 1000);

    return () => {
      window.clearInterval(timer);
      events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      window.removeEventListener('input', markActivity, { capture: true });
    };
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages.length, reduceMotion, resources.length, sending]);

  useEffect(() => {
    if (!open) return;
    const focusFrame = window.requestAnimationFrame(() => panelRef.current?.focus());
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleEscape);
      launcherRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!candidateNudge || open || dismissedNudgeId === candidateNudge.id) {
      if (nudge) setNudge(null);
      return;
    }
    if (nudge?.id === candidateNudge.id) return;

    const isCompletionNudge = candidateNudge.id.startsWith('completion:');
    const lastNudgeAt = readLastNudgeAt(pathname);
    if (!isCompletionNudge && Date.now() - lastNudgeAt < NUDGE_COOLDOWN_MS) return;

    setNudge(candidateNudge);
    writeLastNudgeAt(pathname, Date.now());
  }, [candidateNudge, dismissedNudgeId, nudge, open, pathname]);

  function buildClientContext(trigger: string) {
    return {
      version: 2,
      trigger,
      route: pathname,
      idleSeconds,
      observedAt: new Date().toISOString(),
      page: summarizeSurfaceContext(activeContext),
      related: {
        account: summarizeAccount(accountQuery.data),
        latestCvReview: summarizeCvReview(latestCvReview),
        latestInterview: summarizeInterview(latestInterview),
      },
      verifiedResources: resources
        .filter((resource) => Boolean(resource.url))
        .slice(0, 4)
        .map((resource) => ({
          title: resource.title,
          url: resource.url,
          source: resource.source,
          description: excerpt(resource.description, 500),
        })),
    };
  }

  async function sendAssistantMessage(rawMessage: string, trigger = 'chat') {
    const message = rawMessage.trim();
    if (!message || sending) return;

    const baseMessages = messages.filter((item) => !item.pending);
    const now = new Date().toISOString();
    const optimisticUser: AiMessage = {
      id: `widget-user-${Date.now()}`,
      role: 'USER',
      content: message,
      createdAt: now,
    };
    const pendingAssistant: AiMessage = {
      id: `widget-assistant-pending-${Date.now()}`,
      role: 'ASSISTANT',
      content: 'Đang đọc ngữ cảnh hiện tại...',
      createdAt: now,
      pending: true,
    };

    setDraft('');
    setOpen(true);
    setNudge(null);
    setSending(true);
    setMessages([...baseMessages, optimisticUser, pendingAssistant]);

    try {
      const result = await apiFetch<AiChatResponse>('/ai/chat', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          message,
          conversationId,
          clientContext: buildClientContext(trigger),
        }),
      });

      setConversationId(result.conversationId);
      setMessages([
        ...baseMessages,
        { ...optimisticUser, conversationId: result.conversationId },
        {
          id: `widget-assistant-${Date.now()}`,
          conversationId: result.conversationId,
          role: 'ASSISTANT',
          content: result.message,
          metadata: { contextUpdates: result.contextUpdates },
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      setMessages([
        ...baseMessages,
        optimisticUser,
        {
          id: `widget-assistant-error-${Date.now()}`,
          role: 'ASSISTANT',
          content: error instanceof Error ? error.message : 'Không thể gọi trợ lý lúc này.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function searchResources(queryOverride?: string) {
    const query =
      queryOverride?.trim() ||
      deriveResourceQuery(activeContext, accountQuery.data, latestCvReview, latestInterview);
    if (!query || resourcesLoading) return;

    setOpen(true);
    setNudge(null);
    setResourcesLoading(true);
    setResourceMessage('');

    try {
      const accessToken = await ensureAccessToken();
      const response = await apiFetch<SearchResponse>(
        accessToken ? '/dashboard/resources/search' : '/resources/search',
        {
          method: 'POST',
          headers: accessToken ? authHeaders() : undefined,
          body: JSON.stringify({
            query,
            level: deriveResourceLevel(accountQuery.data, latestInterview),
            goal: deriveResourceGoal(activeContext, accountQuery.data, latestCvReview),
          }),
        },
      );
      setResources(response.results.slice(0, 4));
      setResourceMessage(`Tìm thấy ${response.results.length} tài nguyên cho "${response.query}".`);
    } catch (error) {
      setResourceMessage(
        error instanceof Error ? error.message : 'Không tìm được tài liệu phù hợp.',
      );
    } finally {
      setResourcesLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendAssistantMessage(draft);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  function dismissNudge() {
    if (nudge) setDismissedNudgeId(nudge.id);
    setNudge(null);
  }

  function handleNudgeAction(item: AssistantNudge) {
    if (item.action === 'resources') {
      void searchResources(activeContext.completion?.query);
      return;
    }

    if (item.action === 'roadmap') {
      void sendAssistantMessage(buildRoadmapPrompt(activeContext), 'roadmap-suggestion');
      return;
    }

    if (item.action === 'hint') {
      void sendAssistantMessage(buildHintPrompt(activeContext), 'idle-hint');
      return;
    }

    setOpen(true);
    setNudge(null);
  }

  if (!mounted || accountQuery.unauthenticated) return null;

  const widget = (
    <>
      <AnimatePresence initial={false}>
        {nudge && !open ? (
          <motion.div
            key={nudge.id}
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={motionSpring.panel}
            className="assistant-viewport-nudge w-[min(calc(100vw-2rem),21rem)]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-secondary/30 bg-[#07111f]/95 p-3.5 shadow-[0_24px_90px_rgba(0,0,0,0.55),0_0_44px_rgba(0,212,255,0.18)] backdrop-blur-2xl">
              <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
              <div className="flex items-start gap-3">
                <AssistantAvatar className="mt-0.5 h-10 w-10 border-secondary/30 shadow-[0_0_30px_rgba(0,133,255,0.28)]" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Gợi ý nhanh
                  </div>
                  <p className="text-sm font-semibold text-white">{nudge.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{nudge.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => handleNudgeAction(nudge)}>
                      <Sparkles className="h-3.5 w-3.5" />
                      {nudge.actionLabel}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={dismissNudge}>
                      Để sau
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Ẩn gợi ý"
                  onClick={dismissNudge}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <span className="absolute -bottom-2 right-8 h-5 w-5 rotate-45 border-b border-r border-secondary/30 bg-[#07111f]/95" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.section
            id="learning-assistant-panel"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-label="Trợ lý học tập AI"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={motionSpring.panel}
            className="assistant-viewport-panel flex h-[min(76dvh,44rem)] w-[min(calc(100vw-2rem),29rem)] flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#081321]/95 shadow-[0_28px_110px_rgba(0,0,0,0.48)] outline-none backdrop-blur-2xl"
          >
            <header className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <AssistantAvatar className="h-10 w-10 border-secondary/30 shadow-[0_0_30px_rgba(0,212,255,0.22)]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Trợ lý ngữ cảnh</p>
                    <p className="truncate text-xs text-mutedText">{contextLabel(activeContext)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Thu nhỏ trợ lý"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-secondary/35 hover:text-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {!messages.length ? <WelcomeState context={activeContext} /> : null}
              {messages.map((message) => (
                <ChatBubble
                  key={message.id ?? `${message.role}-${message.createdAt}`}
                  message={message}
                />
              ))}
              {resourceMessage || resourcesLoading || resources.length ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                    {resourcesLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-secondary" />
                    )}
                    Tài liệu gợi ý
                  </div>
                  {resourceMessage ? (
                    <p className="mb-3 text-xs leading-5 text-mutedText">{resourceMessage}</p>
                  ) : null}
                  <div className="space-y-2">
                    {resources.map((resource, index) => (
                      <ResourceMiniCard
                        key={`${resource.url ?? resource.title}-${index}`}
                        resource={resource}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="mb-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void sendAssistantMessage(buildHintPrompt(activeContext), 'manual-hint')
                  }
                  className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-slate-200 transition hover:border-secondary/35 hover:text-secondary"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Hint
                </button>
                <button
                  type="button"
                  onClick={() => void searchResources()}
                  className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-slate-200 transition hover:border-secondary/35 hover:text-secondary"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Tài liệu
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void sendAssistantMessage(buildRoadmapPrompt(activeContext), 'roadmap')
                  }
                  className="flex min-h-10 items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 text-xs font-semibold text-slate-200 transition hover:border-secondary/35 hover:text-secondary"
                >
                  <Route className="h-3.5 w-3.5" />
                  Lộ trình
                </button>
              </div>
              <form ref={formRef} onSubmit={submit} className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Hỏi trợ lý theo màn hình hiện tại..."
                  className="min-h-12 max-h-28 flex-1 resize-none rounded-2xl py-3 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Gửi tin nhắn"
                  disabled={!draft.trim() || sending}
                  className="h-12 w-12"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        ref={launcherRef}
        type="button"
        aria-label={open ? 'Ẩn trợ lý AI' : 'Mở trợ lý AI'}
        aria-expanded={open}
        aria-controls="learning-assistant-panel"
        onClick={() => {
          setOpen((current) => !current);
          setNudge(null);
        }}
        className={cn(
          'assistant-viewport-launcher flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-secondary/35 bg-[#0d1b2d]/95 p-1.5 text-secondary shadow-[0_18px_60px_rgba(0,212,255,0.28)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-secondary/60 hover:shadow-[0_24px_80px_rgba(0,212,255,0.36)]',
          nudge && !open ? 'ring-4 ring-secondary/15' : '',
        )}
      >
        <span className="absolute -inset-1 rounded-[1.65rem] bg-secondary/15 blur-md" />
        <AssistantAvatar className="relative h-full w-full border-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" />
        {nudge && !open ? (
          <span className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-[#0d1b2d] bg-success" />
        ) : null}
      </button>
    </>
  );

  return createPortal(widget, document.body);
}

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-blue-500',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ASSISTANT_ICON_SRC}
        alt=""
        aria-hidden="true"
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  );
}

function WelcomeState({ context }: { context: LearningAssistantContextSnapshot }) {
  return (
    <div className="rounded-xl border border-secondary/20 bg-secondary/[0.08] p-4">
      <div className="flex items-start gap-3">
        <AssistantAvatar className="h-9 w-9 border-secondary/25" />
        <div>
          <p className="text-sm font-semibold text-white">Mình đang theo sát màn hình này.</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {context.summary ??
              'Bạn có thể hỏi nhanh, xin hint nhẹ, tìm tài liệu hoặc nhờ mình gợi ý bước học tiếp theo.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'USER';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[86%] rounded-2xl px-3 py-2 text-sm leading-6',
          isUser
            ? 'bg-success text-white'
            : 'border border-white/10 bg-white/[0.055] text-slate-100',
        )}
      >
        {message.pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {message.content}
          </span>
        ) : (
          <AssistantMarkdownContent compact>{message.content}</AssistantMarkdownContent>
        )}
      </div>
    </div>
  );
}

function ResourceMiniCard({ resource }: { resource: ResourceItem }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/15 p-3">
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge>{resource.difficulty}</Badge>
        <Badge>{resource.type}</Badge>
      </div>
      <p className="text-sm font-semibold leading-5 text-white">{resource.title}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-mutedText">{resource.description}</p>
      {resource.url ? (
        <Link
          href={resource.url}
          target="_blank"
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-secondary transition hover:text-white"
        >
          Mở tài liệu
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function buildNudge(
  context: LearningAssistantContextSnapshot,
  idleSeconds: number,
  open: boolean,
): AssistantNudge | null {
  if (open) return null;

  if (context.completion) {
    return {
      id: `completion:${context.completion.kind}:${context.completion.label}`,
      title: 'Xong phần này rồi',
      body: 'Mình có thể tìm vài tài liệu sát phần vừa làm và gợi ý bước học tiếp theo.',
      action: 'resources',
      actionLabel: 'Tìm tài liệu',
    };
  }

  if (idleSeconds < IDLE_TRIGGER_SECONDS) return null;

  if (context.surface === 'code') {
    return {
      id: `idle:code:${context.problem?.id ?? context.title ?? 'current'}`,
      title: 'Có vẻ bạn đang kẹt ở bài code',
      body: 'Mình có thể đọc đề, code hiện tại và chỉ đưa một hint nhỏ, chưa bật mí lời giải.',
      action: 'hint',
      actionLabel: 'Hint nhẹ',
    };
  }

  if (context.surface === 'interview') {
    return {
      id: `idle:interview:${context.interview?.sessionId ?? context.title ?? 'current'}`,
      title: 'Câu này hơi khó nhỉ',
      body: 'Mình có thể đọc câu hỏi hiện tại và gợi ý khung trả lời ngắn gọn để bạn tiếp tục.',
      action: 'hint',
      actionLabel: 'Gợi ý trả lời',
    };
  }

  if (context.surface === 'cv') {
    return {
      id: `idle:cv:${context.cv?.targetRole ?? context.title ?? 'current'}`,
      title: 'Bạn đang dừng ở phần CV',
      body: 'Mình có thể rà nhanh keyword, điểm yếu và nối nó với lộ trình luyện phỏng vấn.',
      action: 'roadmap',
      actionLabel: 'Gợi ý tiếp',
    };
  }

  if (context.surface === 'roadmap') {
    const weekCount = context.roadmap?.weeks?.length ?? 0;
    return {
      id: `idle:roadmap:${context.roadmap?.requestId ?? context.title ?? 'current'}`,
      title: 'Cần chọn đúng việc tiếp theo?',
      body: weekCount
        ? `Mình có thể đọc mục tiêu và ${weekCount} tuần trong lộ trình để chỉ ra đúng một việc nên làm tiếp.`
        : 'Mình có thể đối chiếu mục tiêu, trình độ và trạng thái lộ trình để gợi ý bước tiếp theo.',
      action: 'hint',
      actionLabel: 'Gợi ý bước tiếp',
    };
  }

  if (context.surface === 'resources') {
    return {
      id: `idle:resources:${context.title ?? 'current'}`,
      title: 'Chưa chọn được tài liệu?',
      body: 'Mình có thể lọc tài liệu theo mục tiêu, trình độ và phần đang học trong lộ trình.',
      action: 'resources',
      actionLabel: 'Lọc tài liệu',
    };
  }

  return {
    id: `idle:${context.surface}:${context.title ?? 'general'}`,
    title: 'Cần một bước nhỏ tiếp theo không?',
    body: 'Mình đang có ngữ cảnh tài khoản, CV, phỏng vấn và trang bạn đang mở.',
    action: 'chat',
    actionLabel: 'Mở trợ lý',
  };
}

function buildHintPrompt(context: LearningAssistantContextSnapshot) {
  if (context.surface === 'code') {
    return `Mình đang luyện bài "${context.problem?.title ?? context.title ?? 'code'}". Hãy đọc đề và code hiện tại trong ngữ cảnh quan sát được, rồi cho đúng một hint nhẹ bằng Tiếng Việt. Đừng đưa lời giải đầy đủ.`;
  }

  if (context.surface === 'interview') {
    return `Hãy đọc câu hỏi phỏng vấn hiện tại và câu trả lời nháp nếu có. Gợi ý một khung trả lời ngắn, tự nhiên, không viết hộ toàn bộ câu trả lời.`;
  }

  if (context.surface === 'cv') {
    return 'Hãy đọc CV/JD hiện tại trong ngữ cảnh quan sát được và gợi ý 3 chỉnh sửa ưu tiên nhất, thật cụ thể.';
  }

  if (context.surface === 'roadmap') {
    const roadmap = context.roadmap;
    return `Hãy đọc đúng lộ trình đang mở cho vị trí "${roadmap?.targetRole ?? context.title ?? 'mục tiêu hiện tại'}", mục tiêu, trạng thái và kế hoạch từng tuần trong ngữ cảnh trang. Chỉ ra đúng một việc cụ thể nên làm tiếp, nêu rõ tuần hoặc hạng mục liên quan và lý do. Không chuyển sang bài code, CV hay phỏng vấn trừ khi chính hạng mục lộ trình đó yêu cầu.`;
  }

  if (context.surface === 'resources') {
    return 'Dựa trên mục tiêu học, trình độ và lộ trình hiện tại, hãy nêu một chủ đề nên ưu tiên tìm tài liệu ngay lúc này và lý do.';
  }

  return 'Dựa trên màn hình và hồ sơ hiện tại, hãy gợi ý một bước nhỏ tiếp theo.';
}

function buildRoadmapPrompt(context: LearningAssistantContextSnapshot) {
  if (context.surface === 'roadmap') {
    return `Hãy rà đúng lộ trình "${context.roadmap?.title ?? context.title ?? 'đang mở'}" trong ngữ cảnh trang. Giữ nguyên mục tiêu chính, xác định phần còn thiếu hoặc chưa cân đối, rồi đề xuất tối đa 3 điều chỉnh cụ thể theo đúng tuần hiện có. Không tạo một lộ trình chung mới.`;
  }
  const surface = context.surface === 'general' ? 'dashboard' : context.surface;
  return `Dựa trên CV gần nhất, điểm phỏng vấn, mục tiêu tài khoản và ngữ cảnh màn hình ${surface}, hãy đề xuất lộ trình học ngắn hạn 2-4 tuần với các việc cần làm tiếp theo.`;
}

function deriveResourceQuery(
  context: LearningAssistantContextSnapshot,
  account: Account | null,
  cvReview?: CvReview,
  interview?: InterviewSession,
) {
  if (context.completion?.query) return context.completion.query;
  if (context.surface === 'code') {
    return [
      context.problem?.title,
      context.problem?.category,
      context.problem?.difficulty,
      'algorithm javascript',
    ]
      .filter(Boolean)
      .join(' ');
  }
  if (context.surface === 'interview') {
    return [
      context.interview?.targetRole,
      context.interview?.level,
      context.interview?.mode,
      'interview practice',
    ]
      .filter(Boolean)
      .join(' ');
  }
  if (context.surface === 'roadmap') {
    return [
      context.roadmap?.targetRole,
      context.roadmap?.currentLevel,
      context.roadmap?.weeks?.[0]?.topics,
      context.roadmap?.weeks?.[0]?.practiceTasks,
    ]
      .filter(Boolean)
      .join(' ');
  }
  const cv = summarizeCvReview(cvReview);
  if (context.surface === 'cv' || cv?.missingKeywords?.length) {
    return [
      context.cv?.targetRole,
      account?.studentProfile?.targetRole,
      ...(cv?.missingKeywords ?? []).slice(0, 4),
    ]
      .filter(Boolean)
      .join(' ');
  }
  return [
    account?.studentProfile?.targetRole,
    account?.studentProfile?.currentLevel,
    interview?.targetRole,
    'learning roadmap',
  ]
    .filter(Boolean)
    .join(' ');
}

function deriveResourceGoal(
  context: LearningAssistantContextSnapshot,
  account: Account | null,
  cvReview?: CvReview,
) {
  const cv = summarizeCvReview(cvReview);
  return (
    context.completion?.label ||
    context.roadmap?.goal ||
    context.roadmap?.targetOutcome ||
    account?.studentProfile?.goals ||
    cv?.recommendedRoadmapItems?.[0] ||
    context.title ||
    'Củng cố kỹ năng hiện tại'
  );
}

function deriveResourceLevel(account: Account | null, interview?: InterviewSession) {
  const level = `${account?.studentProfile?.currentLevel ?? interview?.level ?? ''}`.toLowerCase();
  if (level.includes('senior') || level.includes('advanced')) return 'ADVANCED';
  if (level.includes('junior') || level.includes('intermediate')) return 'INTERMEDIATE';
  if (level.includes('intern') || level.includes('beginner')) return 'BEGINNER';
  return 'FOUNDATION';
}

function summarizeSurfaceContext(context: LearningAssistantContextSnapshot) {
  return {
    ...context,
    problem: context.problem
      ? {
          ...context.problem,
          statement: excerpt(context.problem.statement, 2200),
          inputFormat: excerpt(context.problem.inputFormat, 700),
          outputFormat: excerpt(context.problem.outputFormat, 700),
          constraintsText: excerpt(context.problem.constraintsText, 700),
        }
      : undefined,
    code: context.code
      ? {
          ...context.code,
          content: excerpt(context.code.content, 4200),
          outputExcerpt: excerpt(context.code.outputExcerpt, 1800),
        }
      : undefined,
    interview: context.interview
      ? {
          ...context.interview,
          currentQuestion: excerpt(context.interview.currentQuestion, 1200),
          answerDraft: excerpt(context.interview.answerDraft, 2200),
        }
      : undefined,
    cv: context.cv
      ? {
          ...context.cv,
          cvExcerpt: excerpt(context.cv.cvExcerpt, 3200),
          jdExcerpt: excerpt(context.cv.jdExcerpt, 1800),
        }
      : undefined,
    roadmap: context.roadmap
      ? {
          ...context.roadmap,
          goal: excerpt(context.roadmap.goal, 1200),
          preferredSchedule: excerpt(context.roadmap.preferredSchedule, 500),
          learningStyle: excerpt(context.roadmap.learningStyle, 500),
          summary: excerpt(context.roadmap.summary, 1400),
          targetOutcome: excerpt(context.roadmap.targetOutcome, 1200),
          weeks: context.roadmap.weeks?.slice(0, 8).map((week) => ({
            ...week,
            title: excerpt(week.title, 240),
            objectives: excerpt(week.objectives, 850),
            topics: excerpt(week.topics, 850),
            practiceTasks: excerpt(week.practiceTasks, 850),
            projectTasks: excerpt(week.projectTasks, 850),
            interviewTasks: excerpt(week.interviewTasks, 850),
          })),
        }
      : undefined,
  };
}

function summarizeAccount(account: Account | null) {
  if (!account) return null;
  return {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    role: account.role,
    studentProfile: account.studentProfile
      ? {
          targetRole: account.studentProfile.targetRole,
          currentLevel: account.studentProfile.currentLevel,
          goals: account.studentProfile.goals,
          weeklyHours: account.studentProfile.weeklyHours,
          learningStyle: account.studentProfile.learningStyle,
          expectedSalary: account.studentProfile.expectedSalary,
          preferredLocation: account.studentProfile.preferredLocation,
          personalContext: summarizePersonalContext(account.studentProfile.personalContext),
        }
      : null,
  };
}

function summarizeCvReview(review?: CvReview) {
  if (!review) return null;
  const result = recordFromUnknown(review.result);
  return {
    id: review.id,
    targetRole: review.targetRole,
    overallScore: review.overallScore,
    createdAt: review.createdAt,
    strengths: stringList(result.strengths).slice(0, 5),
    weaknesses: stringList(result.weaknesses).slice(0, 5),
    missingKeywords: stringList(result.missingKeywords).slice(0, 8),
    interviewRiskAreas: stringList(result.interviewRiskAreas).slice(0, 6),
    recommendedRoadmapItems: stringList(result.recommendedRoadmapItems).slice(0, 6),
  };
}

function summarizeInterview(session?: InterviewSession) {
  if (!session) return null;
  const latestAnswer = [...(session.answers ?? [])].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  )[0];
  return {
    id: session.id,
    targetRole: session.targetRole,
    level: session.level,
    mode: session.mode,
    status: session.status,
    overallScore: session.overallScore,
    completedAt: session.completedAt,
    answeredCount: session.answers?.length ?? 0,
    latestAnswer: latestAnswer
      ? {
          question: excerpt(latestAnswer.question, 900),
          score: latestAnswer.score,
          feedback: latestAnswer.feedback,
        }
      : null,
  };
}

function inferRouteContext(pathname: string | null): LearningAssistantContextSnapshot {
  const path = normalizeLearningAssistantRoute(pathname);
  const surface = learningAssistantSurfaceForRoute(path);
  const routeMetadata = { routeKey: path, updatedAt: new Date().toISOString() };
  if (surface === 'code') {
    return {
      ...routeMetadata,
      surface: 'code',
      source: 'route',
      title: 'Luyện code',
      summary: 'Trợ lý sẽ ưu tiên hint theo bài code và trạng thái editor.',
    };
  }
  if (surface === 'interview') {
    return {
      ...routeMetadata,
      surface: 'interview',
      source: 'route',
      title: 'Phỏng vấn AI',
      summary: 'Trợ lý sẽ ưu tiên khung trả lời và phản hồi phỏng vấn.',
    };
  }
  if (surface === 'cv') {
    return {
      ...routeMetadata,
      surface: 'cv',
      source: 'route',
      title: 'Sửa CV',
      summary: 'Trợ lý sẽ ưu tiên CV, JD, keyword còn thiếu và lộ trình bù kỹ năng.',
    };
  }
  if (surface === 'resources') {
    return {
      ...routeMetadata,
      surface: 'resources',
      source: 'route',
      title: 'Tài nguyên',
      summary: 'Trợ lý sẽ ưu tiên chọn tài liệu phù hợp mục tiêu hiện tại.',
    };
  }
  if (surface === 'roadmap') {
    return {
      ...routeMetadata,
      surface: 'roadmap',
      source: 'route',
      title: 'Lộ trình',
      summary: 'Trợ lý sẽ ưu tiên bước học tiếp theo trong lộ trình.',
    };
  }
  if (surface === 'booking') {
    return {
      ...routeMetadata,
      surface: 'booking',
      source: 'route',
      title: 'Lịch học',
      summary: 'Trợ lý sẽ ưu tiên lịch mentor, thời gian rảnh và việc cần chuẩn bị trước buổi học.',
    };
  }
  if (surface === 'profile') {
    return {
      ...routeMetadata,
      surface: 'profile',
      source: 'route',
      title: 'Hồ sơ học viên',
      summary: 'Trợ lý sẽ ưu tiên mục tiêu, trình độ, thời gian học và các ưu tiên đã lưu.',
    };
  }
  return {
    ...routeMetadata,
    surface: surface === 'general' ? 'general' : 'dashboard',
    source: 'route',
    title: 'Tổng quan học viên',
    summary: 'Trợ lý có thể kết nối dữ liệu CV, phỏng vấn, code và lộ trình.',
  };
}

function contextLabel(context: LearningAssistantContextSnapshot) {
  if (context.surface === 'code') return context.problem?.title ?? context.title ?? 'Luyện code';
  if (context.surface === 'interview') {
    return context.interview?.targetRole
      ? `${context.interview.targetRole} · ${context.interview.level ?? 'Interview'}`
      : 'Phỏng vấn AI';
  }
  if (context.surface === 'cv') return context.cv?.targetRole ?? context.title ?? 'Sửa CV';
  if (context.surface === 'roadmap') {
    return context.roadmap?.targetRole ?? context.roadmap?.title ?? context.title ?? 'Lộ trình';
  }
  return context.title ?? 'MentorMind';
}

function recordFromUnknown(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function summarizePersonalContext(value: unknown) {
  const record = recordFromUnknown(value);
  return Object.entries(record)
    .slice(0, 20)
    .reduce<Record<string, unknown>>((result, [key, item]) => {
      if (typeof item === 'string') {
        result[key] = excerpt(item, 500);
      } else if (typeof item === 'number' || typeof item === 'boolean') {
        result[key] = item;
      } else if (Array.isArray(item)) {
        result[key] = item.slice(0, 10).map((entry) => excerpt(entry, 240));
      }
      return result;
    }, {});
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function readLastNudgeAt(pathname: string | null) {
  if (typeof window === 'undefined') return 0;
  const routeKey = encodeURIComponent(normalizeLearningAssistantRoute(pathname));
  return Number(window.localStorage.getItem(`${NUDGE_STORAGE_KEY}:${routeKey}`) ?? 0);
}

function writeLastNudgeAt(pathname: string | null, value: number) {
  if (typeof window === 'undefined') return;
  const routeKey = encodeURIComponent(normalizeLearningAssistantRoute(pathname));
  window.localStorage.setItem(`${NUDGE_STORAGE_KEY}:${routeKey}`, String(value));
}
