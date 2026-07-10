'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { apiFetch, assetUrl, authHeaders, uploadAvatar } from '@/lib/api';
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setMessage('');
    setAvatarUrl(query.data?.avatarUrl ?? '');
  }, [query.data?.id]);

  useEffect(() => {
    setAvatarUrl(query.data?.avatarUrl ?? '');
  }, [query.data?.avatarUrl]);

  async function changeAvatar(file?: File) {
    if (!file) return;
    setUploadingAvatar(true);
    setMessage('');
    try {
      const account = await uploadAvatar<Account>(file);
      setAvatarUrl(account.avatarUrl ?? '');
      setMessage('Đã tải ảnh đại diện mới.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tải được ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get('fullName'),
      avatarUrl: emptyToNull(avatarUrl),
      targetRole: emptyToUndefined(form.get('targetRole')),
      currentLevel: emptyToUndefined(form.get('currentLevel')),
      goals: emptyToUndefined(form.get('goals')),
      weeklyHours: Number(form.get('weeklyHours') || 0) || undefined,
      learningStyle: emptyToUndefined(form.get('learningStyle')),
      budgetRange: emptyToUndefined(form.get('budgetRange')),
      expectedSalary: emptyToUndefined(form.get('expectedSalary')),
      preferredLocation: emptyToUndefined(form.get('preferredLocation')),
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
        <div className="mb-4 flex flex-col items-center rounded-lg border border-white/8 bg-white/[0.03] p-4 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-secondary/30 bg-secondary/12 text-2xl font-bold text-secondary">
            {assetUrl(avatarUrl) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={assetUrl(avatarUrl)}
                alt={query.data.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center">
                {initials(query.data.fullName)}
              </span>
            )}
          </div>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-secondary/35 hover:bg-secondary/10">
            <Camera className="h-4 w-4" />
            {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh đại diện'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploadingAvatar}
              onChange={(event) => void changeAvatar(event.target.files?.[0])}
            />
          </label>
          <p className="mt-2 text-xs leading-5 text-mutedText">
            Hỗ trợ ảnh JPG, PNG, WebP, tối đa 5MB.
          </p>
        </div>
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
          <input type="hidden" name="avatarUrl" value={avatarUrl} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="fullName" defaultValue={query.data.fullName} placeholder="Họ và tên" />
            <Input
              name="targetRole"
              defaultValue={profile?.targetRole ?? ''}
              placeholder="Vai trò mục tiêu"
            />
            <Input
              name="currentLevel"
              defaultValue={profile?.currentLevel ?? ''}
              placeholder="Trình độ hiện tại"
            />
            <Input
              name="weeklyHours"
              type="number"
              min={1}
              defaultValue={profile?.weeklyHours ?? ''}
              placeholder="Số giờ mỗi tuần"
            />
            <Input
              name="budgetRange"
              defaultValue={profile?.budgetRange ?? ''}
              placeholder="Ngân sách dự kiến"
            />
            <Input
              name="expectedSalary"
              defaultValue={profile?.expectedSalary ?? ''}
              placeholder="Mức lương kỳ vọng"
            />
            <Input
              name="preferredLocation"
              defaultValue={profile?.preferredLocation ?? ''}
              placeholder="Địa điểm ưu tiên"
            />
            <Input
              name="learningStyle"
              defaultValue={profile?.learningStyle ?? ''}
              placeholder="Cách học phù hợp"
            />
            <Input
              name="timezone"
              defaultValue={profile?.timezone ?? 'Asia/Ho_Chi_Minh'}
              placeholder="Múi giờ"
            />
          </div>
          <Textarea
            name="goals"
            defaultValue={profile?.goals ?? ''}
            placeholder="Mục tiêu học tập và nghề nghiệp"
          />
          <Textarea
            name="bio"
            defaultValue={profile?.bio ?? ''}
            placeholder="Giới thiệu ngắn về bạn"
          />
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
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
