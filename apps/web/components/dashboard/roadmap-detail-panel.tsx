'use client';

import { useState } from 'react';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  Code2,
  FolderKanban,
  MessageSquareText,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { RoadmapDetail, RoadmapWeek } from '@/lib/domain-types';
import { formatDateTime } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthRequiredCard, ErrorCard, LoadingCard, StatusBadge } from './live-common';

type RoadmapContentItem = {
  title: string;
  description?: string;
};

type WeekSection = {
  key: keyof Pick<
    RoadmapWeek,
    'objectives' | 'topics' | 'practiceTasks' | 'projectTasks' | 'interviewTasks'
  >;
  title: string;
  icon: LucideIcon;
  iconClassName: string;
};

const weekSections: WeekSection[] = [
  {
    key: 'objectives',
    title: 'Mục tiêu tuần',
    icon: Target,
    iconClassName: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300',
  },
  {
    key: 'topics',
    title: 'Kiến thức trọng tâm',
    icon: BookOpen,
    iconClassName: 'border-blue-400/25 bg-blue-400/10 text-blue-300',
  },
  {
    key: 'practiceTasks',
    title: 'Bài luyện tập',
    icon: Code2,
    iconClassName: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
  },
  {
    key: 'projectTasks',
    title: 'Bài tập dự án',
    icon: FolderKanban,
    iconClassName: 'border-violet-400/25 bg-violet-400/10 text-violet-300',
  },
  {
    key: 'interviewTasks',
    title: 'Chuẩn bị phỏng vấn',
    icon: MessageSquareText,
    iconClassName: 'border-amber-400/25 bg-amber-400/10 text-amber-300',
  },
];

const contentWrapperKeys = new Set([
  'items',
  'tasks',
  'list',
  'values',
  'data',
  'content',
  'objectives',
  'topics',
  'practiceTasks',
  'projectTasks',
  'interviewTasks',
]);

const fieldLabels: Record<string, string> = {
  duration: 'Thời lượng',
  deliverable: 'Sản phẩm cần hoàn thành',
  outcome: 'Kết quả',
  resource: 'Tài nguyên',
  resources: 'Tài nguyên',
  deadline: 'Hạn hoàn thành',
};

const legacyTextTranslations: Record<string, string> = {
  'clarify concepts': 'Làm rõ các khái niệm cốt lõi',
  'practice deliberately': 'Luyện tập có chủ đích',
  'review with mentor': 'Ôn tập và nhận góp ý từ mentor',
  'core fundamentals': 'Kiến thức nền tảng cốt lõi',
  'project architecture': 'Kiến trúc dự án',
  'debugging and communication': 'Gỡ lỗi và kỹ năng giao tiếp',
  'solve 3 focused coding problems': 'Giải 3 bài lập trình trọng tâm',
  'write a short learning reflection': 'Viết bản tổng kết ngắn về nội dung đã học',
  'ship one portfolio increment with readme notes':
    'Hoàn thiện một phần portfolio và cập nhật hướng dẫn trong README',
  'answer two role-specific questions and review feedback':
    'Trả lời 2 câu hỏi theo vị trí ứng tuyển và xem lại phản hồi',
};

function translateLegacyText(value: string) {
  const text = value.trim();
  const exactTranslation = legacyTextTranslations[text.toLowerCase().replace(/[.!]+$/, '')];
  if (exactTranslation) return exactTranslation;

  const titleMatch = text.match(/^(.+?)\s+Personalized 1-on-1 Roadmap$/i);
  if (titleMatch?.[1]) return `Lộ trình 1-1 cá nhân hóa: ${titleMatch[1]}`;

  const summaryMatch = text.match(
    /^A mentor-reviewed plan focused on (.+), weekly practice, portfolio output and interview readiness\.?$/i,
  );
  if (summaryMatch?.[1]) {
    return `Lộ trình được mentor duyệt, tập trung vào ${summaryMatch[1]}, luyện tập hằng tuần, hoàn thiện portfolio và sẵn sàng phỏng vấn.`;
  }

  const outcomeMatch = text.match(
    /^Confidently apply for (.+?) roles with a reviewed portfolio and practiced interview stories\.?$/i,
  );
  if (outcomeMatch?.[1]) {
    return `Tự tin ứng tuyển vị trí ${outcomeMatch[1]} với portfolio đã được góp ý và kỹ năng phỏng vấn đã qua luyện tập.`;
  }

  return text;
}

function parseStoredValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;

  let parsed: unknown = value.trim();
  if (!parsed) return '';

  // Some legacy records contain JSON encoded more than once.
  for (let attempt = 0; attempt < 2 && typeof parsed === 'string'; attempt += 1) {
    const text = parsed.trim();
    const looksLikeJson =
      (text.startsWith('[') && text.endsWith(']')) ||
      (text.startsWith('{') && text.endsWith('}')) ||
      (text.startsWith('"') && text.endsWith('"'));
    if (!looksLikeJson) break;

    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      break;
    }
  }

  return parsed;
}

function cleanListText(value: string) {
  const cleaned = value
    .trim()
    .replace(/^[-*\u2022]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim();

  return translateLegacyText(cleaned);
}

function primitiveText(value: unknown): string | undefined {
  if (typeof value === 'string') return cleanListText(value);
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  return undefined;
}

function firstText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const text = primitiveText(parseStoredValue(record[key]));
    if (text) return text;
  }
  return undefined;
}

function splitLegacyText(value: string) {
  const lines = value.split(/\r?\n/).map(cleanListText).filter(Boolean);

  return lines.length > 1 ? lines : [cleanListText(value)].filter(Boolean);
}

function normalizeRoadmapContent(value: unknown, depth = 0): RoadmapContentItem[] {
  if (value == null || depth > 5) return [];

  const parsed = parseStoredValue(value);
  if (typeof parsed === 'string') {
    return splitLegacyText(parsed).map((title) => ({ title }));
  }
  if (typeof parsed === 'number' || typeof parsed === 'boolean') {
    return [{ title: primitiveText(parsed) ?? '' }].filter((item) => item.title);
  }
  if (Array.isArray(parsed)) {
    return parsed.flatMap((item) => normalizeRoadmapContent(item, depth + 1));
  }
  if (typeof parsed !== 'object') return [];

  const record = parsed as Record<string, unknown>;
  const title = firstText(record, ['title', 'name', 'label', 'task', 'objective', 'topic']);
  const description = firstText(record, [
    'description',
    'details',
    'detail',
    'outcome',
    'deliverable',
    'note',
  ]);

  if (title) return [{ title, description: description === title ? undefined : description }];

  return Object.entries(record).flatMap(([key, nestedValue]) => {
    if (contentWrapperKeys.has(key)) return normalizeRoadmapContent(nestedValue, depth + 1);

    const nestedItems = normalizeRoadmapContent(nestedValue, depth + 1);
    if (!nestedItems.length) return [];
    if (/^\d+$/.test(key)) return nestedItems;

    const label = fieldLabels[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2');
    const onlyItem = nestedItems[0];
    if (nestedItems.length === 1 && onlyItem && !onlyItem.description) {
      if (onlyItem.title === 'Có') return [{ title: label }];
      return [{ title: `${label}: ${onlyItem.title}` }];
    }

    return nestedItems;
  });
}

function cleanWeekTitle(title: string | null | undefined, weekNumber: number) {
  if (!title?.trim()) return '';

  const prefix = new RegExp(
    `^(?:(?:tuần|week)\\s*(?:số\\s*)?${weekNumber}\\s*[:.\\-–—|]*\\s*)+`,
    'i',
  );
  const cleaned = title.trim().replace(prefix, '').trim();
  const translatedTitles: Record<string, string> = {
    foundation: 'Nền tảng',
    fundamentals: 'Kiến thức nền tảng',
    build: 'Xây dựng sản phẩm',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
    project: 'Thực hành dự án',
    interview: 'Chuẩn bị phỏng vấn',
    'interview polish': 'Hoàn thiện kỹ năng phỏng vấn',
  };

  return translatedTitles[cleaned.toLowerCase()] ?? cleaned;
}

function RoadmapWeekSection({ section, value }: { section: WeekSection; value: unknown }) {
  const items = normalizeRoadmapContent(value);
  if (!items.length) return null;

  const Icon = section.icon;
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${section.iconClassName}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h5 className="font-semibold text-foreground">{section.title}</h5>
          <p className="text-xs text-mutedText">
            {items.length} {items.length === 1 ? 'nội dung' : 'nội dung cần hoàn thành'}
          </p>
        </div>
      </div>
      <ol className="mt-4 space-y-2.5">
        {items.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="flex gap-3 rounded-md border border-white/[0.07] bg-black/10 px-3 py-2.5"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-foreground/80">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-5 text-foreground/90">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-xs leading-5 text-mutedText">{item.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RoadmapWeekCard({ week }: { week: RoadmapWeek }) {
  const title = cleanWeekTitle(week.title, week.weekNumber);
  const hasContent = weekSections.some(
    (section) => normalizeRoadmapContent(week[section.key]).length > 0,
  );

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-4">
        <span className="inline-flex h-8 items-center rounded-full border border-secondary/25 bg-secondary/10 px-3 text-xs font-semibold text-secondary">
          Tuần {week.weekNumber}
        </span>
        {title ? (
          <h4 className="text-base font-semibold text-foreground sm:text-lg">{title}</h4>
        ) : null}
      </header>

      {hasContent ? (
        <div className="mt-4 grid items-start gap-3 lg:grid-cols-2">
          {weekSections.map((section) => (
            <RoadmapWeekSection key={section.key} section={section} value={week[section.key]} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-white/10 px-4 py-5 text-center">
          <p className="text-sm font-medium text-foreground/85">
            Nội dung tuần đang được hoàn thiện
          </p>
          <p className="mt-1 text-xs leading-5 text-mutedText">
            Mục tiêu, chủ đề và bài thực hành sẽ xuất hiện sau khi lộ trình được cập nhật.
          </p>
        </div>
      )}
    </article>
  );
}

export function RoadmapDetailPanel({ id }: { id: string }) {
  const query = useLiveQuery<RoadmapDetail>(`/roadmap-requests/${id}`, { auth: true, deps: [id] });
  const [message, setMessage] = useState('');

  async function generateDraft() {
    setMessage('');
    try {
      await apiFetch(`/roadmap-requests/${id}/generate-ai-draft`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã tạo bản nháp AI cho lộ trình.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được bản nháp AI');
    }
  }

  async function activate(roadmapId: string) {
    setMessage('');
    try {
      await apiFetch(`/roadmaps/${roadmapId}/activate`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setMessage('Đã kích hoạt lộ trình.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không kích hoạt được lộ trình');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard label="Đang tải chi tiết lộ trình..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const finalRoadmap = query.data.finalRoadmap;
  const roadmap = finalRoadmap ?? query.data.aiDraft;

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{query.data.request.targetRole}</CardTitle>
            <CardDescription>{query.data.request.goal}</CardDescription>
          </CardHeader>
          <StatusBadge value={query.data.request.status} />
        </div>
        <div className="grid gap-3 text-sm text-mutedText md:grid-cols-3">
          <p>Trình độ: {query.data.request.currentLevel}</p>
          <p>{query.data.request.weeklyHours} giờ mỗi tuần</p>
          <p>Cập nhật: {formatDateTime(query.data.request.updatedAt)}</p>
        </div>
        {message ? <p className="mt-4 text-sm text-secondary">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {!query.data.aiDraft && !query.data.finalRoadmap ? (
            <Button onClick={generateDraft}>
              <Bot className="h-4 w-4" />
              Tạo bản nháp AI
            </Button>
          ) : null}
          {finalRoadmap?.status === 'APPROVED' ? (
            <Button variant="secondary" onClick={() => activate(finalRoadmap.id)}>
              <CheckCircle2 className="h-4 w-4" />
              Kích hoạt lộ trình
            </Button>
          ) : null}
        </div>
      </Card>

      {roadmap ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{translateLegacyText(roadmap.title)}</CardTitle>
                <CardDescription>{translateLegacyText(roadmap.summary)}</CardDescription>
              </div>
              <StatusBadge value={roadmap.status} />
            </div>
          </CardHeader>
          {roadmap.targetOutcome ? (
            <div className="flex gap-3 rounded-lg border border-secondary/15 bg-secondary/[0.06] px-4 py-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-secondary">Kết quả mong đợi</p>
                <p className="mt-1 text-sm leading-6 text-foreground/85">
                  {translateLegacyText(roadmap.targetOutcome)}
                </p>
              </div>
            </div>
          ) : null}
          {roadmap.weeks?.length ? (
            <div className="mt-4 space-y-4">
              {[...roadmap.weeks]
                .sort((first, second) => first.weekNumber - second.weekNumber)
                .map((week) => (
                  <RoadmapWeekCard key={`${week.id}-${week.weekNumber}`} week={week} />
                ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-white/10 px-5 py-8 text-center">
              <p className="font-medium text-foreground">Chưa có kế hoạch theo tuần</p>
              <p className="mt-1 text-sm leading-6 text-mutedText">
                Bản nháp đã được tạo nhưng nội dung từng tuần chưa sẵn sàng. Hãy tạo lại hoặc chờ
                admin cập nhật lộ trình.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có bản nháp lộ trình</CardTitle>
            <CardDescription>
              Hãy tạo bản nháp AI, sau đó admin có thể duyệt thành lộ trình chính thức.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
