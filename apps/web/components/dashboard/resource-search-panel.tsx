'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  BookOpenCheck,
  Clock3,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers3,
  Search,
  Sparkles,
} from 'lucide-react';
import { apiFetch, authHeaders, ensureAccessToken } from '@/lib/api';
import { ResourceItem } from '@/lib/domain-types';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState, ErrorCard, LoadingCard, StatusBadge } from './live-common';

type SearchResponse = {
  query: string;
  results: ResourceItem[];
};

const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

function extractMarkdownLinks(value: string) {
  return Array.from(value.matchAll(markdownLinkPattern)).map((match) => ({
    label: match[1] ?? match[2] ?? 'Tài nguyên',
    url: match[2] ?? '',
  }));
}

function stripMarkdownLinks(value: string) {
  return value
    .replace(markdownLinkPattern, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatResourceUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.hostname}${url.pathname === '/' ? '' : url.pathname}`;
  } catch {
    return value;
  }
}

export function ResourceSearchPanel() {
  const curated = useLiveQuery<ResourceItem[]>('/resources');
  const [results, setResults] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [queryText, setQueryText] = useState('AI');
  const [level, setLevel] = useState('FOUNDATION');
  const [goal, setGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [track, setTrack] = useState<'all' | 'beginner' | 'practice'>('all');

  useEffect(() => {
    if (curated.data && !results.length) {
      setResults(curated.data);
    }
  }, [curated.data, results.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query') || params.get('q');
    if (!query) return;

    setQueryText(query);
    void searchResources({
      query,
      level,
      goal: params.get('goal') || query,
    });
    // This intentionally runs once to hydrate a quick search pushed from the dashboard shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const values = new Set<string>();
    results.forEach((resource) => {
      if (resource.category) values.add(resource.category);
      else if (resource.type) values.add(resource.type);
    });
    return ['Tất cả', ...Array.from(values).slice(0, 9)];
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((resource) => {
      const categoryMatch =
        selectedCategory === 'Tất cả' ||
        resource.category === selectedCategory ||
        resource.type === selectedCategory;
      const normalizedDifficulty = String(resource.difficulty ?? '').toLowerCase();
      const practiceMatch =
        track === 'all' ||
        (track === 'beginner' &&
          /beginner|foundation|người mới|nền tảng|easy/i.test(normalizedDifficulty)) ||
        (track === 'practice' &&
          /intermediate|advanced|job|thực chiến|nâng cao|hard/i.test(normalizedDifficulty));
      return categoryMatch && practiceMatch;
    });
  }, [results, selectedCategory, track]);

  async function searchResources(payload: {
    query: FormDataEntryValue | string | null;
    level: string;
    goal: FormDataEntryValue | string | null;
  }) {
    setLoading(true);
    setMessage('');
    const accessToken = await ensureAccessToken();
    const path = accessToken ? '/dashboard/resources/search' : '/resources/search';
    try {
      const response = await apiFetch<SearchResponse>(path, {
        method: 'POST',
        headers: accessToken ? authHeaders() : undefined,
        body: JSON.stringify({
          query: payload.query,
          level: payload.level,
          goal: payload.goal || payload.query,
        }),
      });
      setResults(response.results);
      setSelectedCategory('Tất cả');
      setTrack('all');
      setMessage(`Đã tìm thấy ${response.results.length} tài nguyên cho "${response.query}".`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tìm được tài nguyên');
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await searchResources({ query: queryText, level, goal: goal || queryText });
  }

  return (
    <div className="space-y-5">
      <section className="dashboard-surface overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-soft">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Thư viện học tập cá nhân hóa
            </div>
            <CardHeader className="mb-0 mt-4">
              <CardTitle className="text-2xl">Tìm tài nguyên theo mục tiêu</CardTitle>
              <CardDescription>
                Lọc kho nội bộ, Tavily và đề xuất AI theo vai trò, trình độ và lịch sử học của tài khoản.
              </CardDescription>
            </CardHeader>
            <form onSubmit={submit} className="mt-5 grid gap-3 md:grid-cols-[1.2fr_0.55fr] xl:grid-cols-[1.2fr_0.52fr_0.8fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-mutedText" />
                <Input
                  name="query"
                  value={queryText}
                  onChange={(event) => setQueryText(event.target.value)}
                  className="pl-10"
                  placeholder="Ví dụ: React performance, SQL joins..."
                  required
                />
              </div>
              <select
                name="level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-secondary/40"
              >
                <option value="BEGINNER">Người mới</option>
                <option value="FOUNDATION">Nền tảng</option>
                <option value="INTERMEDIATE">Trung cấp</option>
                <option value="ADVANCED">Nâng cao</option>
                <option value="JOB_READY">Sẵn sàng đi làm</option>
              </select>
              <Input
                name="goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="Mục tiêu ứng dụng"
              />
              <Button disabled={loading}>{loading ? 'Đang tìm...' : 'Tìm'}</Button>
            </form>
            {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
          </div>
          <div className="relative z-10 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Metric icon={<BookOpenCheck className="h-4 w-4" />} label="Tài nguyên đang xem" value={String(results.length)} />
            <Metric icon={<Layers3 className="h-4 w-4" />} label="Nhóm nội dung" value={String(Math.max(categories.length - 1, 0))} />
            <Metric icon={<GraduationCap className="h-4 w-4" />} label="Bộ lọc hiển thị" value={String(filteredResults.length)} />
          </div>
        </div>
      </section>

      {curated.loading && !results.length ? <LoadingCard label="Đang tải tài nguyên..." /> : null}
      {curated.error && !results.length ? <ErrorCard message={curated.error} onRetry={curated.reload} /> : null}
      {!curated.loading && !curated.error && !results.length ? (
        <EmptyState
          title="Chưa có tài nguyên"
          description="Hãy thử tìm bằng từ khóa cụ thể để hệ thống gọi Tavily và AI gợi ý tài nguyên mới."
        />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Filter className="h-4 w-4 text-secondary" />
              Bộ lọc nhanh
            </div>
            <div className="grid gap-2">
              {[
                ['all', 'Tất cả tài nguyên'],
                ['beginner', 'Dành cho người mới'],
                ['practice', 'Thực chiến / nâng cao'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTrack(value as typeof track)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.98] ${
                    track === value
                      ? 'border-secondary/35 bg-secondary/12 text-white'
                      : 'border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/15 hover:bg-white/[0.06]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <p className="mb-3 text-sm font-semibold text-white">Danh mục</p>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition active:scale-[0.98] ${
                    selectedCategory === category
                      ? 'border-success/35 bg-success/12 text-white'
                      : 'border-white/8 bg-white/[0.025] text-slate-300 hover:border-white/15 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="truncate">{category}</span>
                  <span className="text-xs text-mutedText">
                    {category === 'Tất cả'
                      ? results.length
                      : results.filter((item) => item.category === category || item.type === category).length}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </aside>

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredResults.map((resource, index) => {
          const descriptionLinks = extractMarkdownLinks(resource.description);
          const cleanDescription = stripMarkdownLinks(resource.description);
          return (
            <Card key={`${resource.url ?? resource.title}-${index}`} className="flex min-h-[25rem] flex-col">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge value={resource.difficulty} />
                <Badge>{resource.type}</Badge>
                {resource.isExternal ? <Badge>Nguồn ngoài</Badge> : <Badge>Nội bộ</Badge>}
              </div>
              <div className="mb-4 flex h-32 items-end overflow-hidden rounded-xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,119,255,0.32),rgba(87,184,70,0.18),rgba(245,158,11,0.22))] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/14 text-white shadow-soft">
                  <BookOpenCheck className="h-6 w-6" />
                </div>
              </div>
              <CardHeader>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{cleanDescription}</CardDescription>
              </CardHeader>
              <p className="text-sm text-mutedText">
                Nguồn: {resource.source}
                {resource.author ? ` · ${resource.author}` : ''}
              </p>
              {resource.url ? (
                <div className="mt-4 rounded-lg border border-secondary/20 bg-secondary/8 p-3">
                  <p className="text-xs font-semibold uppercase tracking-normal text-secondary">Link tài nguyên</p>
                  <Link
                    href={resource.url}
                    target="_blank"
                    className="mt-2 flex items-start gap-2 break-all text-sm font-medium leading-6 text-slate-100 transition hover:text-secondary"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                    {formatResourceUrl(resource.url)}
                  </Link>
                </div>
              ) : null}
              {descriptionLinks.length ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-normal text-mutedText">Link trong mô tả</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {descriptionLinks.slice(0, 5).map((link) => (
                      <Link
                        key={`${link.url}-${link.label}`}
                        href={link.url}
                        target="_blank"
                        className="inline-flex max-w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200 transition hover:border-secondary/40 hover:text-secondary"
                      >
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              {resource.whyRecommended ? (
                <p className="mt-3 text-sm leading-6 text-slate-200">{resource.whyRecommended}</p>
              ) : null}
              {resource.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {resource.tags.slice(0, 6).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              ) : null}
              <div className="mt-auto pt-4">
                {resource.estimatedMinutes ? (
                  <p className="mb-3 flex items-center gap-2 text-xs text-mutedText">
                    <Clock3 className="h-3.5 w-3.5 text-secondary" />
                    Ước tính {resource.estimatedMinutes} phút đọc/luyện
                  </p>
                ) : null}
              {resource.url ? (
                <Link href={resource.url} target="_blank" className="inline-flex">
                  <Button variant="outline">
                    Mở tài nguyên
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
              </div>
            </Card>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
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
