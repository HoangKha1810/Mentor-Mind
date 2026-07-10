export const LEARNING_ASSISTANT_CONTEXT_EVENT = 'mentormind:learning-assistant-context';

const STORAGE_KEY = 'mentormind.learningAssistantContext';

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
  completion?: {
    kind: 'code' | 'interview' | 'cv';
    label: string;
    query: string;
    score?: number | null;
    occurredAt?: string;
  };
  metadata?: Record<string, unknown>;
};

export function publishLearningAssistantContext(snapshot: LearningAssistantContextSnapshot) {
  if (typeof window === 'undefined') return;

  const next = {
    ...snapshot,
    updatedAt: snapshot.updatedAt ?? new Date().toISOString(),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Session storage is an enhancement; live events still keep the assistant useful.
  }

  window.dispatchEvent(new CustomEvent(LEARNING_ASSISTANT_CONTEXT_EVENT, { detail: next }));
}

export function readStoredLearningAssistantContext() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LearningAssistantContextSnapshot) : null;
  } catch {
    return null;
  }
}

export function excerpt(value: unknown, maxLength = 1800) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
