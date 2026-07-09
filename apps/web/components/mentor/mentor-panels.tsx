'use client';

import Link from 'next/link';
import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  FilePenLine,
  Save,
  Send,
  UserRound,
} from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import { Account, Booking } from '@/lib/domain-types';
import { formatDateTime, formatStatus, toDateTimeLocalValue } from '@/lib/format';
import { useLiveQuery } from '@/lib/live-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AuthRequiredCard,
  EmptyState,
  ErrorCard,
  JsonBlock,
  LoadingCard,
  StatusBadge,
} from '@/components/dashboard/live-common';

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
};

type HomeworkSubmission = {
  id: string;
  content: string;
  status: string;
  mentorFeedback?: string | null;
  score?: number | null;
  createdAt: string;
};

type Homework = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  createdAt: string;
  student?: Pick<Account, 'id' | 'fullName' | 'email' | 'avatarUrl'> | null;
  submissions?: HomeworkSubmission[];
};

type SessionNote = {
  id: string;
  summary: string;
  strengths: unknown;
  weaknesses: unknown;
  nextSteps: unknown;
  privateNote?: string | null;
  createdAt: string;
};

type SessionDetail = {
  booking: Booking;
  notes: SessionNote[];
  homework: Homework[];
};

type MentorStudent = Pick<Account, 'id' | 'email' | 'fullName' | 'avatarUrl' | 'studentProfile' | 'lastLoginAt'> & {
  bookingCount: number;
  latestBooking?: Booking | null;
};

type MentorStudentDetail = {
  student: MentorStudent;
  bookings: Booking[];
  roadmaps: unknown[];
  homework: Homework[];
};

export function MentorSchedulePanel() {
  const bookings = useLiveQuery<Booking[]>('/mentor/bookings', { auth: true });
  const availability = useLiveQuery<Availability[]>('/mentors/me/availability', { auth: true });
  const [message, setMessage] = useState('');
  const defaultSlots = useMemo(
    () => ({
      slots: [
        { dayOfWeek: 1, startTime: '19:00', endTime: '21:00', timezone: 'Asia/Ho_Chi_Minh', isActive: true },
        { dayOfWeek: 3, startTime: '19:00', endTime: '21:00', timezone: 'Asia/Ho_Chi_Minh', isActive: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '11:00', timezone: 'Asia/Ho_Chi_Minh', isActive: true },
      ],
    }),
    [],
  );

  async function updateStatus(id: string, status: string) {
    await apiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    bookings.reload();
  }

  async function saveAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    try {
      await apiFetch('/mentors/me/availability', {
        method: 'POST',
        headers: authHeaders(),
        body: String(new FormData(event.currentTarget).get('slots')),
      });
      setMessage('Đã lưu lịch rảnh.');
      availability.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được lịch rảnh');
    }
  }

  if (bookings.unauthenticated || availability.unauthenticated) {
    return <AuthRequiredCard message="Đăng nhập bằng tài khoản mentor để quản lý lịch dạy." />;
  }
  if (bookings.loading || availability.loading) return <LoadingCard label="Đang tải lịch mentor..." />;
  if (bookings.error) return <ErrorCard message={bookings.error} onRetry={bookings.reload} />;
  if (availability.error) return <ErrorCard message={availability.error} onRetry={availability.reload} />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Lịch rảnh hằng tuần</CardTitle>
          <CardDescription>Nhập các khung giờ mentor có thể nhận lịch. API sẽ thay thế toàn bộ lịch cũ.</CardDescription>
        </CardHeader>
        <JsonBlock value={availability.data} />
        <form onSubmit={saveAvailability} className="mt-4 space-y-3">
          <Textarea
            name="slots"
            defaultValue={JSON.stringify(
              availability.data?.length
                ? { slots: availability.data.map(({ dayOfWeek, startTime, endTime, timezone, isActive }) => ({ dayOfWeek, startTime, endTime, timezone, isActive })) }
                : defaultSlots,
              null,
              2,
            )}
            className="min-h-56 font-mono text-xs"
          />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button>
            <Save className="h-4 w-4" />
            Lưu lịch rảnh
          </Button>
        </form>
      </Card>

      <ListGate
        data={bookings.data}
        emptyTitle="Chưa có lịch dạy"
        emptyDescription="Khi học viên hoặc admin đặt lịch, booking sẽ xuất hiện tại đây."
      >
        {(items) => (
          <Grid>
            {items.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <CardTitle>{formatDateTime(booking.startTime)}</CardTitle>
                  <CardDescription>
                    {booking.student?.fullName ?? booking.studentId} · kết thúc {formatDateTime(booking.endTime)}
                  </CardDescription>
                </CardHeader>
                <div className="mb-4 flex flex-wrap gap-2">
                  <StatusBadge value={booking.status} />
                  {booking.meetingUrl ? <Badge>Đã có meeting URL</Badge> : null}
                </div>
                {booking.studentNote ? <p className="mb-4 text-sm text-slate-200">{booking.studentNote}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {['CONFIRMED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'NO_SHOW'].map((status) => (
                    <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(booking.id, status)}>
                      {formatStatus(status)}
                    </Button>
                  ))}
                  <Link href={`/mentor/sessions/${booking.id}`}>
                    <Button size="sm" variant="secondary">
                      <FilePenLine className="h-4 w-4" />
                      Chi tiết
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </Grid>
        )}
      </ListGate>
    </div>
  );
}

export function MentorStudentsPanel() {
  const query = useLiveQuery<MentorStudent[]>('/mentor/students', { auth: true });
  return (
    <DataGate query={query} emptyTitle="Chưa có học viên" emptyDescription="Danh sách được lấy từ các booking thật của mentor.">
      {(students) => (
        <Grid>
          {students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <CardTitle>{student.fullName}</CardTitle>
                <CardDescription>{student.email}</CardDescription>
              </CardHeader>
              <div className="mb-4 flex flex-wrap gap-2">
                <Badge>{student.bookingCount} buổi</Badge>
                {student.latestBooking ? <StatusBadge value={student.latestBooking.status} /> : null}
              </div>
              {student.studentProfile ? <JsonBlock value={student.studentProfile} /> : null}
              <Link href={`/mentor/students/${student.id}`}>
                <Button variant="secondary">
                  <UserRound className="h-4 w-4" />
                  Mở hồ sơ
                </Button>
              </Link>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function MentorStudentDetailPanel({ id }: { id: string }) {
  const query = useLiveQuery<MentorStudentDetail>(`/mentor/students/${id}`, { auth: true, deps: [id] });
  return (
    <DataGate query={query} emptyTitle="Không có dữ liệu học viên" emptyDescription="Mentor chỉ xem được học viên đã có booking.">
      {(detail) => (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{detail.student.fullName}</CardTitle>
              <CardDescription>
                {detail.student.email} · đăng nhập gần nhất {formatDateTime(detail.student.lastLoginAt)}
              </CardDescription>
            </CardHeader>
            <JsonBlock value={detail.student.studentProfile} />
          </Card>
          <Section title="Buổi học" icon={<CalendarCheck className="h-4 w-4" />}>
            <ListGate data={detail.bookings} emptyTitle="Chưa có buổi học" emptyDescription="Học viên này chưa có booking với mentor.">
              {(bookings) => (
                <Grid>
                  {bookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardHeader>
                        <CardTitle>{formatDateTime(booking.startTime)}</CardTitle>
                        <CardDescription>{booking.meetingUrl ?? 'Chưa có meeting URL'}</CardDescription>
                      </CardHeader>
                      <StatusBadge value={booking.status} />
                      <Link href={`/mentor/sessions/${booking.id}`} className="mt-4 inline-flex">
                        <Button variant="secondary" size="sm">Mở buổi học</Button>
                      </Link>
                    </Card>
                  ))}
                </Grid>
              )}
            </ListGate>
          </Section>
          <Section title="Lộ trình" icon={<ClipboardCheck className="h-4 w-4" />}>
            <JsonBlock value={detail.roadmaps} />
          </Section>
          <Section title="Bài tập" icon={<CheckCircle2 className="h-4 w-4" />}>
            <HomeworkList items={detail.homework} />
          </Section>
        </div>
      )}
    </DataGate>
  );
}

export function MentorSessionDetailPanel({ id }: { id: string }) {
  const query = useLiveQuery<SessionDetail>(`/mentor/bookings/${id}`, { auth: true, deps: [id] });
  const [message, setMessage] = useState('');
  const dueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 0, 0);
    return toDateTimeLocalValue(date);
  }, []);

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch(`/sessions/${id}/notes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          summary: form.get('summary'),
          strengths: splitList(form.get('strengths')),
          weaknesses: splitList(form.get('weaknesses')),
          nextSteps: splitList(form.get('nextSteps')),
          privateNote: optional(form.get('privateNote')),
        }),
      });
      event.currentTarget.reset();
      setMessage('Đã lưu ghi chú buổi học.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được ghi chú');
    }
  }

  async function addHomework(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch(`/sessions/${id}/homework`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: form.get('title'),
          description: form.get('description'),
          dueDate: new Date(String(form.get('dueDate'))).toISOString(),
        }),
      });
      event.currentTarget.reset();
      setMessage('Đã giao bài tập.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không giao được bài tập');
    }
  }

  return (
    <DataGate query={query} emptyTitle="Không tìm thấy buổi học" emptyDescription="Kiểm tra lại quyền mentor hoặc booking id.">
      {(detail) => (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CardHeader>
                <CardTitle>{formatDateTime(detail.booking.startTime)}</CardTitle>
                <CardDescription>
                  Học viên {detail.booking.student?.fullName ?? detail.booking.studentId} · {detail.booking.meetingUrl ?? 'chưa có meeting URL'}
                </CardDescription>
              </CardHeader>
              <StatusBadge value={detail.booking.status} />
            </div>
            {message ? <p className="text-sm text-secondary">{message}</p> : null}
          </Card>

          <Grid>
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú buổi học</CardTitle>
                <CardDescription>Ghi nhận điểm mạnh, điểm yếu và bước tiếp theo cho học viên.</CardDescription>
              </CardHeader>
              <form onSubmit={addNote} className="space-y-3">
                <Textarea name="summary" placeholder="Tóm tắt buổi học" />
                <Input name="strengths" placeholder="Điểm mạnh, ngăn cách bằng dấu phẩy" />
                <Input name="weaknesses" placeholder="Điểm cần cải thiện" />
                <Input name="nextSteps" placeholder="Bước tiếp theo" />
                <Textarea name="privateNote" placeholder="Ghi chú riêng cho mentor/admin" />
                <Button>
                  <Save className="h-4 w-4" />
                  Lưu ghi chú
                </Button>
              </form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giao bài tập</CardTitle>
                <CardDescription>Bài tập sẽ xuất hiện trong tài khoản học viên.</CardDescription>
              </CardHeader>
              <form onSubmit={addHomework} className="space-y-3">
                <Input name="title" placeholder="Tên bài tập" />
                <Textarea name="description" placeholder="Mô tả yêu cầu và tiêu chí hoàn thành" />
                <Input name="dueDate" type="datetime-local" defaultValue={dueDate} />
                <Button variant="secondary">
                  <Send className="h-4 w-4" />
                  Giao bài
                </Button>
              </form>
            </Card>
          </Grid>

          <Section title="Ghi chú đã lưu" icon={<FilePenLine className="h-4 w-4" />}>
            <ListGate data={detail.notes} emptyTitle="Chưa có ghi chú" emptyDescription="Sau khi mentor lưu ghi chú, dữ liệu sẽ nằm ở đây.">
              {(notes) => (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <p className="font-medium text-white">{note.summary}</p>
                      <p className="mt-1 text-sm text-mutedText">{formatDateTime(note.createdAt)}</p>
                      <JsonBlock value={{ strengths: note.strengths, weaknesses: note.weaknesses, nextSteps: note.nextSteps }} />
                    </Card>
                  ))}
                </div>
              )}
            </ListGate>
          </Section>

          <Section title="Bài tập của buổi học" icon={<ClipboardCheck className="h-4 w-4" />}>
            <HomeworkList items={detail.homework} onReviewed={query.reload} />
          </Section>
        </div>
      )}
    </DataGate>
  );
}

export function MentorHomeworkPanel() {
  const query = useLiveQuery<Homework[]>('/mentor/homework', { auth: true });
  return (
    <DataGate query={query} emptyTitle="Chưa có bài tập" emptyDescription="Khi mentor giao bài hoặc học viên nộp bài, danh sách sẽ xuất hiện.">
      {(items) => <HomeworkList items={items} onReviewed={query.reload} />}
    </DataGate>
  );
}

function HomeworkList({ items, onReviewed }: { items: Homework[]; onReviewed?: () => void }) {
  const [message, setMessage] = useState('');

  async function review(event: FormEvent<HTMLFormElement>, submissionId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setMessage('');
    try {
      await apiFetch(`/homework-submissions/${submissionId}/review`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          mentorFeedback: form.get('mentorFeedback'),
          score: Number(form.get('score') || 0),
        }),
      });
      setMessage('Đã lưu nhận xét bài nộp.');
      onReviewed?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không chấm được bài');
    }
  }

  if (!items.length) {
    return <EmptyState title="Chưa có bài tập" description="Danh sách bài tập thật sẽ xuất hiện tại đây." />;
  }

  return (
    <div className="space-y-4">
      {message ? <Card><p className="text-sm text-secondary">{message}</p></Card> : null}
      <Grid>
        {items.map((homework) => (
          <Card key={homework.id}>
            <CardHeader>
              <CardTitle>{homework.title}</CardTitle>
              <CardDescription>
                {homework.student?.fullName ? `${homework.student.fullName} · ` : ''}hạn {formatDateTime(homework.dueDate)}
              </CardDescription>
            </CardHeader>
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge value={homework.status} />
              <Badge>{homework.submissions?.length ?? 0} bài nộp</Badge>
            </div>
            <p className="mb-4 text-sm leading-6 text-slate-200">{homework.description}</p>
            {(homework.submissions ?? []).map((submission) => (
              <div key={submission.id} className="mt-3 rounded-md border border-white/8 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">Bài nộp {formatDateTime(submission.createdAt)}</p>
                  <StatusBadge value={submission.status} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-mutedText">{submission.content}</p>
                {submission.mentorFeedback ? (
                  <p className="mt-3 text-sm text-secondary">
                    Nhận xét: {submission.mentorFeedback}
                    {submission.score !== null && submission.score !== undefined ? ` · ${submission.score}/100` : ''}
                  </p>
                ) : (
                  <form onSubmit={(event) => review(event, submission.id)} className="mt-3 space-y-2">
                    <Textarea name="mentorFeedback" placeholder="Nhận xét cho học viên" />
                    <Input name="score" type="number" min={0} max={100} placeholder="Điểm 0-100" />
                    <Button size="sm" variant="secondary">
                      <CheckCircle2 className="h-4 w-4" />
                      Lưu nhận xét
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </Card>
        ))}
      </Grid>
    </div>
  );
}

function DataGate<T>({
  query,
  children,
  emptyTitle,
  emptyDescription,
}: {
  query: ReturnType<typeof useLiveQuery<T>>;
  children: (data: T) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (query.unauthenticated) return <AuthRequiredCard message="Đăng nhập để xem dữ liệu của tài khoản mentor." />;
  if (query.loading) return <LoadingCard />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data || (Array.isArray(query.data) && !query.data.length)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return <>{children(query.data)}</>;
}

function ListGate<T>({
  data,
  children,
  emptyTitle,
  emptyDescription,
}: {
  data: T[] | null;
  children: (data: T[]) => ReactNode;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (!data?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(data)}</>;
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || undefined;
}
