'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
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

  useEffect(() => {
    if (curated.data && !results.length) {
      setResults(curated.data);
    }
  }, [curated.data, results.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const form = new FormData(event.currentTarget);
    const accessToken = await ensureAccessToken();
    const path = accessToken ? '/dashboard/resources/search' : '/resources/search';
    try {
      const response = await apiFetch<SearchResponse>(path, {
        method: 'POST',
        headers: accessToken ? authHeaders() : undefined,
        body: JSON.stringify({
          query: form.get('query'),
          level: form.get('level'),
          goal: form.get('goal') || form.get('query'),
        }),
      });
      setResults(response.results);
      setMessage(`Đã tìm thấy ${response.results.length} tài nguyên cho "${response.query}".`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tìm được tài nguyên');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tìm tài nguyên theo mục tiêu</CardTitle>
          <CardDescription>
            Kết quả lấy từ kho nội bộ, Tavily và đề xuất AI theo ngữ cảnh tài khoản khi đã đăng nhập.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-mutedText" />
            <Input name="query" className="pl-9" placeholder="Ví dụ: React performance, SQL joins..." required />
          </div>
          <select
            name="level"
            defaultValue="FOUNDATION"
            className="h-11 rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"
          >
            <option value="BEGINNER">Người mới</option>
            <option value="FOUNDATION">Nền tảng</option>
            <option value="INTERMEDIATE">Trung cấp</option>
            <option value="ADVANCED">Nâng cao</option>
            <option value="JOB_READY">Sẵn sàng đi làm</option>
          </select>
          <Input name="goal" placeholder="Mục tiêu ứng dụng" />
          <Button disabled={loading}>{loading ? 'Đang tìm...' : 'Tìm'}</Button>
        </form>
        {message ? <p className="mt-3 text-sm text-secondary">{message}</p> : null}
      </Card>

      {curated.loading && !results.length ? <LoadingCard label="Đang tải tài nguyên..." /> : null}
      {curated.error && !results.length ? <ErrorCard message={curated.error} onRetry={curated.reload} /> : null}
      {!curated.loading && !curated.error && !results.length ? (
        <EmptyState
          title="Chưa có tài nguyên"
          description="Hãy thử tìm bằng từ khóa cụ thể để hệ thống gọi Tavily và AI gợi ý tài nguyên mới."
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((resource, index) => {
          const descriptionLinks = extractMarkdownLinks(resource.description);
          const cleanDescription = stripMarkdownLinks(resource.description);
          return (
            <Card key={`${resource.url ?? resource.title}-${index}`}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge value={resource.difficulty} />
                <Badge>{resource.type}</Badge>
                {resource.isExternal ? <Badge>Nguồn ngoài</Badge> : <Badge>Nội bộ</Badge>}
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
              {resource.url ? (
                <Link href={resource.url} target="_blank" className="mt-4 inline-flex">
                  <Button variant="outline">
                    Mở tài nguyên
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
