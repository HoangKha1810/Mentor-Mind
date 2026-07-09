'use client';

import Link from 'next/link';
import { formatCurrency } from '@mentormind/shared';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { PackageItem } from '@/lib/domain-types';
import { packageCategoryLabel, packageLevelLabel } from '@/lib/labels';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorCard, LoadingCard } from '@/components/dashboard/live-common';

type PackageListResponse = {
  items: PackageItem[];
  total: number;
  page: number;
  limit: number;
};

export function PackageBrowser({ compact = false }: { compact?: boolean }) {
  const [search, setSearch] = useState('');
  const params = new URLSearchParams({ limit: compact ? '3' : '50' });
  if (search.trim()) params.set('search', search.trim());
  const query = useLiveQuery<PackageListResponse>(`/packages?${params.toString()}`, {
    deps: [search, compact],
  });

  if (query.loading && !query.data) return <LoadingCard label="Đang tải gói học..." />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;

  const packages = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      {!compact ? (
        <div className="flex flex-col gap-3 rounded-lg border border-white/8 bg-white/[0.03] p-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-mutedText" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm frontend, backend, AI, phỏng vấn..."
            />
          </div>
        </div>
      ) : null}

      {!packages.length ? (
        <EmptyState
          title="Chưa có gói học đã publish"
          description="Admin cần tạo và publish gói học trước khi người dùng có thể xem hoặc gửi yêu cầu tư vấn."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((pack) => (
            <Card key={pack.id}>
              <div className="flex items-center justify-between gap-3">
                <Badge>{packageCategoryLabel(pack.category)}</Badge>
                <span className="text-sm text-mutedText">{pack.durationWeeks} tuần</span>
              </div>
              <CardHeader className="mt-4">
                <CardTitle>{pack.title}</CardTitle>
                <CardDescription>{pack.shortDescription}</CardDescription>
              </CardHeader>
              <div className="mb-5 flex flex-wrap gap-2">
                <Badge>{packageLevelLabel(pack.level)}</Badge>
                <Badge>{pack.recommendedSessions} buổi</Badge>
                <Badge>{pack.mentorType}</Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-2xl font-semibold text-white">
                  {formatCurrency(Number(pack.price), pack.currency)}
                </span>
                <Link href={`/packages/${pack.slug}`}>
                  <Button>Xem chi tiết</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
