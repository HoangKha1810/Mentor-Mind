export const LEARNING_ASSISTANT_CONTEXT_EVENT = 'mentormind:learning-assistant-context';

const LEGACY_STORAGE_KEY = 'mentormind.learningAssistantContext';
const STORAGE_KEY_PREFIX = 'mentormind.learningAssistantContext.v2:';
const STORAGE_VERSION = 2;
const MAX_STORED_ROUTES = 12;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
let latestPublishedContext: LearningAssistantContextSnapshot | null = null;

export const LEARNING_ASSISTANT_CONTEXT_TTL_MS = 30 * 60 * 1000;

export type LearningAssistantSurface =
  | 'dashboard'
  | 'roadmap'
  | 'booking'
  | 'code'
  | 'interview'
  | 'resources'
  | 'cv'
  | 'profile'
  | 'general';

export type LearningAssistantContextSnapshot = {
  surface: LearningAssistantSurface;
  source: string;
  routeKey?: string;
  title?: string;
  summary?: string;
  updatedAt?: string;
  problem?: {
    id?: string;
    slug?: string;
    title?: string;
    difficulty?: string;
    category?: string;
    statement?: string;
    inputFormat?: string;
    outputFormat?: string;
    constraintsText?: string;
    examples?: unknown;
  };
  code?: {
    language?: string;
    content?: string;
    chars?: number;
    lastAction?: 'editing' | 'run' | 'submit' | 'hint';
    outputExcerpt?: string;
    verdict?: string;
    completed?: boolean;
  };
  interview?: {
    sessionId?: string;
    targetRole?: string;
    level?: string;
    mode?: string;
    status?: string;
    currentQuestion?: string;
    answerDraft?: string;
    answeredCount?: number;
    overallScore?: number | null;
    completed?: boolean;
  };
  cv?: {
    targetRole?: string;
    cvExcerpt?: string;
    jdExcerpt?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    latestScore?: number;
    completed?: boolean;
  };
  roadmap?: {
    requestId?: string;
    targetRole?: string;
    goal?: string;
    currentLevel?: string;
    requestStatus?: string;
    weeklyHours?: number;
    preferredSchedule?: string;
    learningStyle?: string;
    wantsInterviewPrep?: boolean;
    wantsCodePractice?: boolean;
    roadmapId?: string;
    title?: string;
    summary?: string;
    targetOutcome?: string;
    durationWeeks?: number;
    roadmapStatus?: string;
    weeks?: Array<{
      weekNumber: number;
      title?: string;
      objectives?: string;
      topics?: string;
      practiceTasks?: string;
      projectTasks?: string;
      interviewTasks?: string;
    }>;
  };
  completion?: {
    kind: 'code' | 'interview' | 'cv';
    label: string;
    query: string;
    score?: number | null;
    occurredAt?: string;
  };
  metadata?: Record<string, unknown>;
};

type StoredContextCollection = {
  version: typeof STORAGE_VERSION;
  contexts: Record<string, LearningAssistantContextSnapshot>;
};

export function normalizeLearningAssistantRoute(pathname: string | null | undefined) {
  const raw = (pathname || '/dashboard').split(/[?#]/, 1)[0] || '/dashboard';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, '') : withLeadingSlash;
}

export function learningAssistantSurfaceForRoute(
  pathname: string | null | undefined,
): LearningAssistantSurface {
  const path = normalizeLearningAssistantRoute(pathname);
  if (path.includes('/code-practice')) return 'code';
  if (path.includes('/interview')) return 'interview';
  if (path.includes('/cv-review')) return 'cv';
  if (path.includes('/resources')) return 'resources';
  if (path.includes('/roadmaps')) return 'roadmap';
  if (path.includes('/bookings') || path.includes('/schedule')) return 'booking';
  if (path.includes('/profile')) return 'profile';
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'dashboard';
  return 'general';
}

export function isLearningAssistantContextCurrent(
  snapshot: LearningAssistantContextSnapshot | null | undefined,
  pathname: string | null | undefined,
  now = Date.now(),
) {
  if (!snapshot?.routeKey || !snapshot.updatedAt) return false;

  const routeKey = normalizeLearningAssistantRoute(snapshot.routeKey);
  const currentRoute = normalizeLearningAssistantRoute(pathname);
  if (routeKey !== currentRoute) return false;
  if (snapshot.surface !== learningAssistantSurfaceForRoute(currentRoute)) return false;

  const updatedAt = Date.parse(snapshot.updatedAt);
  if (!Number.isFinite(updatedAt)) return false;
  if (updatedAt - now > MAX_FUTURE_SKEW_MS) return false;
  return now - updatedAt <= LEARNING_ASSISTANT_CONTEXT_TTL_MS;
}

export function publishLearningAssistantContext(snapshot: LearningAssistantContextSnapshot) {
  if (typeof window === 'undefined') return;

  const next: LearningAssistantContextSnapshot = {
    ...snapshot,
    routeKey: normalizeLearningAssistantRoute(window.location.pathname),
    updatedAt: snapshot.updatedAt ?? new Date().toISOString(),
  };

  latestPublishedContext = next;
  window.dispatchEvent(new CustomEvent(LEARNING_ASSISTANT_CONTEXT_EVENT, { detail: next }));
}

export function readLatestPublishedLearningAssistantContext(
  pathname: string | null | undefined,
  now = Date.now(),
) {
  return isLearningAssistantContextCurrent(latestPublishedContext, pathname, now)
    ? latestPublishedContext
    : null;
}

export function storeLearningAssistantContext(
  userId: string,
  snapshot: LearningAssistantContextSnapshot,
  now = Date.now(),
) {
  if (typeof window === 'undefined' || !userId) return;
  if (!isLearningAssistantContextCurrent(snapshot, snapshot.routeKey, now)) return;

  try {
    const storageKey = contextStorageKey(userId);
    const collection = parseStoredCollection(window.sessionStorage.getItem(storageKey));
    const contexts = pruneContexts(
      { ...collection.contexts, [normalizeLearningAssistantRoute(snapshot.routeKey)]: snapshot },
      now,
    );
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({ version: STORAGE_VERSION, contexts } satisfies StoredContextCollection),
    );
    window.sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Live events still keep the assistant useful when browser storage is unavailable.
  }
}

export function readStoredLearningAssistantContext(
  userId: string,
  pathname: string | null | undefined,
  now = Date.now(),
) {
  if (typeof window === 'undefined' || !userId) return null;

  try {
    window.sessionStorage.removeItem(LEGACY_STORAGE_KEY);
    const storageKey = contextStorageKey(userId);
    const collection = parseStoredCollection(window.sessionStorage.getItem(storageKey));
    const contexts = pruneContexts(collection.contexts, now);
    const nextCollection = { version: STORAGE_VERSION, contexts } satisfies StoredContextCollection;
    window.sessionStorage.setItem(storageKey, JSON.stringify(nextCollection));

    const routeKey = normalizeLearningAssistantRoute(pathname);
    const snapshot = contexts[routeKey];
    return isLearningAssistantContextCurrent(snapshot, routeKey, now) ? snapshot : null;
  } catch {
    return null;
  }
}

export function clearStoredLearningAssistantContexts() {
  latestPublishedContext = null;
  if (typeof window === 'undefined') return;

  try {
    const keys = Array.from({ length: window.sessionStorage.length }, (_, index) =>
      window.sessionStorage.key(index),
    ).filter((key): key is string => Boolean(key));
    keys
      .filter((key) => key === LEGACY_STORAGE_KEY || key.startsWith(STORAGE_KEY_PREFIX))
      .forEach((key) => window.sessionStorage.removeItem(key));
  } catch {
    // Logging out must still succeed if storage access is blocked.
  }
}

export function excerpt(value: unknown, maxLength = 1800) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function contextStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(userId)}`;
}

function parseStoredCollection(raw: string | null): StoredContextCollection {
  if (!raw) return { version: STORAGE_VERSION, contexts: {} };
  try {
    const parsed = JSON.parse(raw) as Partial<StoredContextCollection>;
    if (parsed.version !== STORAGE_VERSION || !isRecord(parsed.contexts)) {
      return { version: STORAGE_VERSION, contexts: {} };
    }
    return {
      version: STORAGE_VERSION,
      contexts: parsed.contexts as Record<string, LearningAssistantContextSnapshot>,
    };
  } catch {
    return { version: STORAGE_VERSION, contexts: {} };
  }
}

function pruneContexts(contexts: Record<string, LearningAssistantContextSnapshot>, now: number) {
  return Object.entries(contexts)
    .filter(([routeKey, snapshot]) => isLearningAssistantContextCurrent(snapshot, routeKey, now))
    .sort(
      ([, left], [, right]) => Date.parse(right.updatedAt ?? '') - Date.parse(left.updatedAt ?? ''),
    )
    .slice(0, MAX_STORED_ROUTES)
    .reduce<Record<string, LearningAssistantContextSnapshot>>((result, [routeKey, snapshot]) => {
      result[routeKey] = snapshot;
      return result;
    }, {});
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
