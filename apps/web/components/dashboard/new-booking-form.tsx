'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { Mentor } from '@/lib/domain-types';
import { toDateTimeLocalValue } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AuthRequiredCard, EmptyState, ErrorCard, LoadingCard } from './live-common';

export function NewBookingForm() {
  const mentors = useLiveQuery<Mentor[]>('/mentors');
  const [message, setMessage] = useState('');
  const startDefault = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(19, 0, 0, 0);
    return toDateTimeLocalValue(date);
  }, []);
  const endDefault = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(20, 0, 0, 0);
    return toDateTimeLocalValue(date);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch('/bookings', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          mentorId: form.get('mentorId'),
          startTime: new Date(String(form.get('startTime'))).toISOString(),
          endTime: new Date(String(form.get('endTime'))).toISOString(),
          timezone: form.get('timezone') || 'Asia/Ho_Chi_Minh',
          studentNote: form.get('studentNote'),
        }),
      });
      setMessage('Đã tạo yêu cầu đặt lịch. Trạng thái sẽ cập nhật trong lịch học.');
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không đặt được buổi học');
    }
  }

  if (mentors.loading) return <LoadingCard label="Đang tải danh sách mentor..." />;
  if (mentors.error) return <ErrorCard message={mentors.error} onRetry={mentors.reload} />;
  if (!mentors.data?.length) {
    return (
      <EmptyState
        title="Chưa có mentor đang nhận lịch"
        description="Admin cần tạo hoặc kích hoạt mentor trước khi học viên có thể đặt buổi học."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Mentor đang mở lịch</CardTitle>
          <CardDescription>Chọn một mentor phù hợp với mục tiêu hiện tại.</CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {mentors.data.map((mentor) => (
            <div key={mentor.id} className="rounded-md border border-white/8 bg-white/[0.03] p-3">
              <p className="font-medium text-white">{mentor.fullName}</p>
              <p className="text-sm leading-6 text-mutedText">
                {mentor.mentorProfile?.headline ?? 'Mentor MentorMind'}
              </p>
              {mentor.mentorProfile?.rating ? (
                <p className="text-xs text-secondary">Rating {mentor.mentorProfile.rating}/5</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Đặt buổi học mới</CardTitle>
          <CardDescription>
            Yêu cầu được lưu vào hệ thống thật và chờ mentor/admin xác nhận.
          </CardDescription>
        </CardHeader>
        <form onSubmit={submit} className="space-y-4">
          <select
            name="mentorId"
            required
            className="h-11 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"
          >
            {mentors.data.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.fullName}
              </option>
            ))}
          </select>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="startTime" type="datetime-local" defaultValue={startDefault} required />
            <Input name="endTime" type="datetime-local" defaultValue={endDefault} required />
          </div>
          <Input name="timezone" defaultValue="Asia/Ho_Chi_Minh" placeholder="Múi giờ" />
          <Textarea name="studentNote" placeholder="Bạn muốn học gì trong buổi này?" />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button>
            <CalendarPlus className="h-4 w-4" />
            Gửi yêu cầu đặt lịch
          </Button>
        </form>
      </Card>
    </div>
  );
}
