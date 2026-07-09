'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { useLiveQuery } from '@/lib/live-query';
import { Account } from '@/lib/domain-types';
import { formatDateTime, formatStatus } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, ErrorCard, LoadingCard } from './live-common';

export function ProfileSettings() {
  const query = useLiveQuery<Account>('/auth/me', { auth: true });
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage('');
  }, [query.data?.id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get('fullName'),
      avatarUrl: emptyToNull(form.get('avatarUrl')),
      targetRole: emptyToUndefined(form.get('targetRole')),
      currentLevel: emptyToUndefined(form.get('currentLevel')),
      goals: emptyToUndefined(form.get('goals')),
      weeklyHours: Number(form.get('weeklyHours') || 0) || undefined,
      learningStyle: emptyToUndefined(form.get('learningStyle')),
      budgetRange: emptyToUndefined(form.get('budgetRange')),
      timezone: emptyToUndefined(form.get('timezone')),
      bio: emptyToUndefined(form.get('bio')),
    };

    try {
      await apiFetch<Account>('/users/me', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      setMessage('Đã lưu hồ sơ tài khoản.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được hồ sơ');
    }
  }

  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading && !query.data) return <LoadingCard />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data) return null;

  const profile = query.data.studentProfile;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader>
          <CardTitle>{query.data.fullName}</CardTitle>
          <CardDescription>{query.data.email}</CardDescription>
        </CardHeader>
        <div className="space-y-3 text-sm">
          <Info label="Vai trò" value={formatStatus(query.data.role)} />
          <Info label="Trạng thái" value={formatStatus(query.data.status)} />
          <Info label="Lần đăng nhập gần nhất" value={formatDateTime(query.data.lastLoginAt)} />
          <Info label="Múi giờ" value={profile?.timezone ?? 'Asia/Ho_Chi_Minh'} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cập nhật hồ sơ học viên</CardTitle>
          <CardDescription>
            Những thông tin này được AI và mentor dùng để cá nhân hóa lộ trình, tài nguyên và buổi
            học.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="fullName" defaultValue={query.data.fullName} placeholder="Họ và tên" />
            <Input name="avatarUrl" defaultValue={query.data.avatarUrl ?? ''} placeholder="URL ảnh đại diện" />
            <Input name="targetRole" defaultValue={profile?.targetRole ?? ''} placeholder="Vai trò mục tiêu" />
            <Input name="currentLevel" defaultValue={profile?.currentLevel ?? ''} placeholder="Trình độ hiện tại" />
            <Input
              name="weeklyHours"
              type="number"
              min={1}
              defaultValue={profile?.weeklyHours ?? ''}
              placeholder="Số giờ mỗi tuần"
            />
            <Input name="budgetRange" defaultValue={profile?.budgetRange ?? ''} placeholder="Ngân sách dự kiến" />
            <Input name="learningStyle" defaultValue={profile?.learningStyle ?? ''} placeholder="Cách học phù hợp" />
            <Input name="timezone" defaultValue={profile?.timezone ?? 'Asia/Ho_Chi_Minh'} placeholder="Múi giờ" />
          </div>
          <Textarea name="goals" defaultValue={profile?.goals ?? ''} placeholder="Mục tiêu học tập và nghề nghiệp" />
          <Textarea name="bio" defaultValue={profile?.bio ?? ''} placeholder="Giới thiệu ngắn về bạn" />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button>
            <Save className="h-4 w-4" />
            Lưu hồ sơ
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-white/[0.03] p-3">
      <p className="text-xs text-mutedText">{label}</p>
      <p className="mt-1 text-slate-100">{value}</p>
    </div>
  );
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : undefined;
}

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}
