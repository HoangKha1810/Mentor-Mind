'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  FilePenLine,
  Plus,
  RefreshCcw,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import { apiFetch, authHeaders } from '@/lib/api';
import {
  Booking,
  CodeProblem,
  InterviewQuestion,
  Mentor,
  PackageItem,
  ResourceItem,
  RoadmapDetail,
  RoadmapRequest,
  SupportTicket,
} from '@/lib/domain-types';
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

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string | null;
};
type Payment = {
  id: string;
  studentId: string;
  packageId?: string | null;
  roadmapId?: string | null;
  amount: string | number;
  currency: string;
  status: string;
  provider: string;
  providerRef?: string | null;
  createdAt: string;
};
type AuditLog = {
  id: string;
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: unknown;
  createdAt: string;
};
type AiUsageSummary = {
  recent: Array<{
    id: string;
    feature: string;
    provider: string;
    model: string;
    status: string;
    estimatedCost: string | number;
    latencyMs: number;
    errorMessage?: string | null;
    createdAt: string;
  }>;
  total: number;
  failed: number;
};
type PromptTemplate = {
  id: string;
  key: string;
  name: string;
  description: string;
  template: string;
  version: number;
  isActive: boolean;
};

export function AdminUsersPanel() {
  const query = useLiveQuery<Paginated<AdminUser>>('/admin/users?limit=100', { auth: true });
  async function updateStatus(id: string, status: string) {
    await apiFetch(`/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    query.reload();
  }
  return (
    <DataGate query={query}>
      {(data) => (
        <Grid>
          {data.items.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.fullName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <div className="mb-4 flex flex-wrap gap-2">
                <StatusBadge value={user.role} />
                <StatusBadge value={user.status} />
              </div>
              <p className="text-sm text-mutedText">Tạo lúc {formatDateTime(user.createdAt)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'].map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={user.status === status ? 'primary' : 'outline'}
                    onClick={() => updateStatus(user.id, status)}
                  >
                    {formatStatus(status)}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminBookingsPanel() {
  const query = useLiveQuery<Booking[]>('/admin/bookings', { auth: true });
  async function updateStatus(id: string, status: string) {
    await apiFetch(`/bookings/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    query.reload();
  }
  return (
    <DataGate query={query}>
      {(items) => (
        <Grid>
          {items.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle>{formatDateTime(booking.startTime)}</CardTitle>
                <CardDescription>
                  {booking.student?.fullName ?? booking.studentId} với {booking.mentor?.fullName ?? booking.mentorId}
                </CardDescription>
              </CardHeader>
              <StatusBadge value={booking.status} />
              <div className="mt-4 flex flex-wrap gap-2">
                {['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'].map((status) => (
                  <Button key={status} size="sm" variant="outline" onClick={() => updateStatus(booking.id, status)}>
                    {formatStatus(status)}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminSupportPanel() {
  const query = useLiveQuery<SupportTicket[]>('/admin/support/tickets', { auth: true });
  async function update(id: string, payload: Record<string, string>) {
    await apiFetch(`/admin/support/tickets/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    query.reload();
  }
  return (
    <DataGate query={query}>
      {(items) => (
        <Grid>
          {items.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <CardTitle>{ticket.subject}</CardTitle>
                <CardDescription>{ticket.message}</CardDescription>
              </CardHeader>
              <div className="mb-4 flex flex-wrap gap-2">
                <StatusBadge value={ticket.status} />
                <StatusBadge value={ticket.priority} />
              </div>
              <div className="flex flex-wrap gap-2">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                  <Button key={status} size="sm" variant="outline" onClick={() => update(ticket.id, { status })}>
                    {formatStatus(status)}
                  </Button>
                ))}
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                  <Button key={priority} size="sm" variant="secondary" onClick={() => update(ticket.id, { priority })}>
                    {formatStatus(priority)}
                  </Button>
                ))}
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminPaymentsPanel() {
  const query = useLiveQuery<Payment[]>('/admin/payments', { auth: true });
  return (
    <DataGate query={query}>
      {(items) => (
        <Grid>
          {items.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <CardTitle>
                  {Number(payment.amount).toLocaleString('vi-VN')} {payment.currency}
                </CardTitle>
                <CardDescription>{payment.providerRef ?? payment.id}</CardDescription>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={payment.status} />
                <Badge>{payment.provider}</Badge>
              </div>
              <p className="mt-3 text-sm text-mutedText">Tạo lúc {formatDateTime(payment.createdAt)}</p>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminAuditLogsPanel() {
  const query = useLiveQuery<AuditLog[]>('/admin/audit-logs?limit=200', { auth: true });
  return (
    <DataGate query={query}>
      {(items) => (
        <div className="space-y-3">
          {items.map((log) => (
            <Card key={log.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{log.action}</p>
                  <p className="text-sm text-mutedText">
                    {log.entityType} · {log.entityId} · {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <Badge>{log.actorId ?? 'system'}</Badge>
              </div>
              <JsonBlock value={log.metadata} />
            </Card>
          ))}
        </div>
      )}
    </DataGate>
  );
}

export function AdminMentorsPanel() {
  const query = useLiveQuery<Mentor[]>('/admin/mentors', { auth: true });
  return (
    <DataGate query={query}>
      {(items) => (
        <Grid>
          {items.map((mentor) => (
            <Card key={mentor.id}>
              <CardHeader>
                <CardTitle>{mentor.fullName}</CardTitle>
                <CardDescription>{mentor.mentorProfile?.headline ?? mentor.id}</CardDescription>
              </CardHeader>
              <JsonBlock value={mentor.mentorProfile} />
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminRoadmapRequestsPanel() {
  const query = useLiveQuery<RoadmapRequest[]>('/admin/roadmap-requests', { auth: true });
  return (
    <DataGate query={query}>
      {(items) => (
        <Grid>
          {items.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.targetRole}</CardTitle>
                <CardDescription>{request.goal}</CardDescription>
              </CardHeader>
              <div className="mb-4 flex flex-wrap gap-2">
                <StatusBadge value={request.status} />
                <Badge>{request.currentLevel}</Badge>
              </div>
              <Link href={`/admin/roadmap-requests/${request.id}`}>
                <Button variant="secondary">
                  <FilePenLine className="h-4 w-4" />
                  Mở chi tiết
                </Button>
              </Link>
            </Card>
          ))}
        </Grid>
      )}
    </DataGate>
  );
}

export function AdminRoadmapRequestDetailPanel({ id }: { id: string }) {
  const detail = useLiveQuery<RoadmapDetail>(`/roadmap-requests/${id}`, { auth: true, deps: [id] });
  const mentors = useLiveQuery<Mentor[]>('/admin/mentors', { auth: true });
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

  async function post(path: string, payload?: unknown) {
    setMessage('');
    try {
      await apiFetch(path, {
        method: 'POST',
        headers: authHeaders(),
        body: payload ? JSON.stringify(payload) : undefined,
      });
      setMessage('Đã cập nhật yêu cầu lộ trình.');
      detail.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không cập nhật được yêu cầu');
    }
  }

  if (detail.unauthenticated) return <AuthRequiredCard />;
  if (detail.loading || mentors.loading) return <LoadingCard />;
  if (detail.error) return <ErrorCard message={detail.error} onRetry={detail.reload} />;
  if (!detail.data) return null;

  const roadmap = detail.data.finalRoadmap ?? detail.data.aiDraft;
  const mentorOptions = mentors.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardHeader>
            <CardTitle>{detail.data.request.targetRole}</CardTitle>
            <CardDescription>{detail.data.request.goal}</CardDescription>
          </CardHeader>
          <StatusBadge value={detail.data.request.status} />
        </div>
        {message ? <p className="mb-4 text-sm text-secondary">{message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => post(`/roadmap-requests/${id}/generate-ai-draft`)}>
            <Plus className="h-4 w-4" />
            Tạo bản nháp AI
          </Button>
          <Button variant="secondary" onClick={() => post(`/admin/roadmap-requests/${id}/approve`)}>
            <CheckCircle2 className="h-4 w-4" />
            Duyệt lộ trình
          </Button>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Phân mentor và lên lịch tư vấn</CardTitle>
          <CardDescription>Thao tác này tạo booking thật và thông báo cho học viên.</CardDescription>
        </CardHeader>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void post(`/admin/roadmap-requests/${id}/schedule-consultation`, {
              mentorId: form.get('mentorId'),
              startTime: new Date(String(form.get('startTime'))).toISOString(),
              endTime: new Date(String(form.get('endTime'))).toISOString(),
              timezone: form.get('timezone') || 'Asia/Ho_Chi_Minh',
              meetingUrl: optional(form.get('meetingUrl')),
              adminNote: optional(form.get('adminNote')),
            });
          }}
        >
          <select name="mentorId" className="h-12 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm text-white">
            {mentorOptions.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.fullName}
              </option>
            ))}
          </select>
          <Input name="timezone" defaultValue="Asia/Ho_Chi_Minh" />
          <Input name="startTime" type="datetime-local" defaultValue={startDefault} />
          <Input name="endTime" type="datetime-local" defaultValue={endDefault} />
          <Input name="meetingUrl" placeholder="Meeting URL" />
          <Input name="adminNote" placeholder="Ghi chú admin" />
          <Button className="md:col-span-2">
            <Send className="h-4 w-4" />
            Lên lịch tư vấn
          </Button>
        </form>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void post(`/admin/roadmap-requests/${id}/assign-mentor`, { mentorId: form.get('mentorId') });
          }}
        >
          <select name="mentorId" className="h-12 flex-1 rounded-full border border-white/10 bg-white/[0.055] px-4 text-sm text-white">
            {mentorOptions.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.fullName}
              </option>
            ))}
          </select>
          <Button variant="outline">Phân mentor</Button>
        </form>
      </Card>
      {roadmap ? (
        <Card>
          <CardHeader>
            <CardTitle>{roadmap.title}</CardTitle>
            <CardDescription>{roadmap.summary}</CardDescription>
          </CardHeader>
          <JsonBlock value={roadmap} />
        </Card>
      ) : (
        <EmptyState title="Chưa có bản nháp" description="Tạo bản nháp AI trước khi duyệt lộ trình." />
      )}
    </div>
  );
}

export function AdminAiCenterPanel() {
  const settings = useLiveQuery<{ provider: string; model: string }>('/admin/ai/settings', { auth: true });
  const usage = useLiveQuery<AiUsageSummary>('/admin/ai/usage', { auth: true });
  if (settings.unauthenticated || usage.unauthenticated) return <AuthRequiredCard />;
  if (settings.loading || usage.loading) return <LoadingCard />;
  if (settings.error) return <ErrorCard message={settings.error} onRetry={settings.reload} />;
  if (usage.error) return <ErrorCard message={usage.error} onRetry={usage.reload} />;
  return (
    <Grid>
      <Card>
        <CardHeader>
          <CardTitle>Provider</CardTitle>
          <CardDescription>
            {settings.data?.provider} · {settings.data?.model}
          </CardDescription>
        </CardHeader>
        <Link href="/admin/ai/settings"><Button>Cài đặt AI</Button></Link>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{usage.data?.total ?? 0} lượt gọi AI</CardTitle>
          <CardDescription>{usage.data?.failed ?? 0} lỗi đã ghi nhận</CardDescription>
        </CardHeader>
        <Link href="/admin/ai/usage"><Button variant="secondary">Xem log</Button></Link>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prompt template</CardTitle>
          <CardDescription>Sửa và test prompt theo từng tính năng.</CardDescription>
        </CardHeader>
        <Link href="/admin/ai/prompts"><Button variant="outline">Mở prompt</Button></Link>
      </Card>
    </Grid>
  );
}

export function AdminAiUsagePanel() {
  const query = useLiveQuery<AiUsageSummary>('/admin/ai/usage', { auth: true });
  return (
    <DataGate query={query}>
      {(data) => (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="Tổng lượt" value={data.total} />
            <Stat label="Lỗi" value={data.failed} />
            <Stat label="Log gần đây" value={data.recent.length} />
          </div>
          {data.recent.map((log) => (
            <Card key={log.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{log.feature}</p>
                  <p className="text-sm text-mutedText">
                    {log.provider}/{log.model} · {log.latencyMs}ms · {formatDateTime(log.createdAt)}
                  </p>
                </div>
                <StatusBadge value={log.status} />
              </div>
              {log.errorMessage ? <p className="mt-3 text-sm text-warning">{log.errorMessage}</p> : null}
            </Card>
          ))}
        </div>
      )}
    </DataGate>
  );
}

export function AdminAiSettingsPanel() {
  const query = useLiveQuery<Record<string, unknown>>('/admin/ai/settings', { auth: true });
  return (
    <JsonPatchPanel
      query={query}
      title="Cài đặt AI"
      description={'Lưu key/value vào bảng AISetting. Ví dụ: {"LEARNING_ASSISTANT:enabled": true}'}
      endpoint="/admin/ai/settings"
      template={{ 'LEARNING_ASSISTANT:enabled': true, dailyCostLimitUsd: 5 }}
      method="PATCH"
    />
  );
}

export function AdminAiPromptsPanel() {
  const query = useLiveQuery<PromptTemplate[]>('/admin/ai/prompt-templates', { auth: true });
  const [message, setMessage] = useState('');
  async function update(template: PromptTemplate, form: FormData) {
    await apiFetch(`/admin/ai/prompt-templates/${template.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({
        description: form.get('description'),
        template: form.get('template'),
        isActive: form.get('isActive') === 'on',
      }),
    });
    setMessage('Đã lưu prompt template.');
    query.reload();
  }
  async function test(template: PromptTemplate, form: FormData) {
    const result = await apiFetch(`/admin/ai/prompt-templates/${template.id}/test`, {
      method: 'POST',
      headers: authHeaders(),
      body: String(form.get('variables') || '{}'),
    });
    setMessage(JSON.stringify(result, null, 2));
  }
  return (
    <DataGate query={query}>
      {(items) => (
        <div className="space-y-4">
          {message ? <Card><pre className="overflow-auto text-xs text-slate-200">{message}</pre></Card> : null}
          {items.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.key} · v{template.version}</CardDescription>
              </CardHeader>
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void update(template, new FormData(event.currentTarget));
                }}
              >
                <Input name="description" defaultValue={template.description} />
                <Textarea name="template" defaultValue={template.template} className="min-h-36 font-mono text-xs" />
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input name="isActive" type="checkbox" defaultChecked={template.isActive} /> Đang bật
                </label>
                <Textarea name="variables" defaultValue='{"targetRole":"Frontend Intern","goal":"Đi làm"}' className="font-mono text-xs" />
                <div className="flex flex-wrap gap-2">
                  <Button><Save className="h-4 w-4" /> Lưu prompt</Button>
                  <Button type="button" variant="outline" onClick={(event) => {
                    const form = new FormData(event.currentTarget.closest('form')!);
                    void test(template, form);
                  }}>Test prompt</Button>
                </div>
              </form>
            </Card>
          ))}
        </div>
      )}
    </DataGate>
  );
}

export function AdminPackagesPanel() {
  return (
    <AdminJsonCrudPanel<PackageItem>
      title="Gói học"
      listPath="/admin/packages?includeDrafts=true&limit=50"
      createPath="/admin/packages"
      deleteBase="/admin/packages"
      editBase="/admin/packages"
      newHref="/admin/packages/new"
      template={packageTemplate}
    />
  );
}

export function AdminPackageEditorPanel({ id }: { id?: string }) {
  return (
    <AdminJsonEditorPanel
      title={id ? 'Sửa gói học' : 'Tạo gói học'}
      detailPath={id ? `/admin/packages/${id}` : undefined}
      savePath={id ? `/admin/packages/${id}` : '/admin/packages'}
      method={id ? 'PATCH' : 'POST'}
      template={packageTemplate}
      backHref="/admin/packages"
    />
  );
}

export function AdminResourcesPanel() {
  return (
    <AdminJsonCrudPanel<ResourceItem>
      title="Tài nguyên"
      listPath="/admin/resources"
      createPath="/admin/resources"
      deleteBase="/admin/resources"
      template={resourceTemplate}
    />
  );
}

export function AdminCodeProblemsPanel() {
  return (
    <AdminJsonCrudPanel<CodeProblem>
      title="Bài code"
      listPath="/admin/code/problems"
      createPath="/admin/code/problems"
      deleteBase="/admin/code/problems"
      editBase="/admin/code-problems"
      newHref="/admin/code-problems/new"
      template={codeProblemTemplate}
    />
  );
}

export function AdminCodeProblemEditorPanel({ id }: { id?: string }) {
  return (
    <AdminJsonEditorPanel
      title={id ? 'Sửa bài code' : 'Tạo bài code'}
      detailPath={id ? `/admin/code/problems/${id}` : undefined}
      savePath={id ? `/admin/code/problems/${id}` : '/admin/code/problems'}
      method={id ? 'PATCH' : 'POST'}
      template={codeProblemTemplate}
      backHref="/admin/code-problems"
    />
  );
}

export function AdminInterviewQuestionsPanel() {
  return (
    <AdminJsonCrudPanel<InterviewQuestion>
      title="Câu hỏi phỏng vấn"
      listPath="/interview-questions?includeInactive=true"
      createPath="/admin/interview-questions"
      deleteBase="/admin/interview-questions"
      template={interviewQuestionTemplate}
    />
  );
}

function AdminJsonCrudPanel<T extends { id?: string; title?: string; name?: string; key?: string; status?: string }>({
  title,
  listPath,
  createPath,
  deleteBase,
  editBase,
  newHref,
  template,
}: {
  title: string;
  listPath: string;
  createPath: string;
  deleteBase: string;
  editBase?: string;
  newHref?: string;
  template: unknown;
}) {
  const query = useLiveQuery<T[] | Paginated<T>>(listPath, { auth: listPath.startsWith('/admin') });
  const [message, setMessage] = useState('');
  const items = Array.isArray(query.data) ? query.data : query.data?.items ?? [];

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    try {
      await apiFetch(createPath, {
        method: 'POST',
        headers: authHeaders(),
        body: String(new FormData(event.currentTarget).get('json')),
      });
      setMessage('Đã tạo bản ghi.');
      event.currentTarget.reset();
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không tạo được bản ghi');
    }
  }

  async function remove(id: string) {
    await apiFetch(`${deleteBase}/${id}`, { method: 'DELETE', headers: authHeaders() });
    query.reload();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Tạo {title.toLowerCase()}</CardTitle>
              <CardDescription>Dán JSON hợp lệ theo template để tạo bản ghi thật.</CardDescription>
            </div>
            {newHref ? <Link href={newHref}><Button variant="outline">Mở form riêng</Button></Link> : null}
          </div>
        </CardHeader>
        <form onSubmit={create} className="space-y-3">
          <Textarea name="json" defaultValue={pretty(template)} className="min-h-48 font-mono text-xs" />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <Button><Plus className="h-4 w-4" /> Tạo</Button>
        </form>
      </Card>
      <DataGate query={query}>
        {() => (
          <Grid>
            {items.map((item) => {
              const id = item.id ?? item.key ?? '';
              return (
                <Card key={id}>
                  <CardHeader>
                    <CardTitle>{item.title ?? item.name ?? item.key ?? id}</CardTitle>
                    <CardDescription>{id}</CardDescription>
                  </CardHeader>
                  {item.status ? <StatusBadge value={item.status} /> : null}
                  <JsonBlock value={item} />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {editBase && id ? (
                      <Link href={`${editBase}/${id}/edit`}>
                        <Button variant="secondary" size="sm">Sửa</Button>
                      </Link>
                    ) : null}
                    {id ? (
                      <Button variant="outline" size="sm" onClick={() => remove(id)}>
                        <Trash2 className="h-4 w-4" /> Xóa
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </Grid>
        )}
      </DataGate>
    </div>
  );
}

function AdminJsonEditorPanel({
  title,
  detailPath,
  savePath,
  method,
  template,
  backHref,
}: {
  title: string;
  detailPath?: string;
  savePath: string;
  method: 'POST' | 'PATCH';
  template: unknown;
  backHref: string;
}) {
  const router = useRouter();
  const query = useLiveQuery<unknown>(detailPath ?? null, { auth: Boolean(detailPath), deps: [detailPath] });
  const [message, setMessage] = useState('');
  const defaultValue = pretty(query.data ?? template);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    try {
      await apiFetch(savePath, {
        method,
        headers: authHeaders(),
        body: String(new FormData(event.currentTarget).get('json')),
      });
      setMessage('Đã lưu dữ liệu.');
      router.push(backHref);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được dữ liệu');
    }
  }

  if (query.loading) return <LoadingCard />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Form JSON trực tiếp với validation từ API.</CardDescription>
      </CardHeader>
      <form onSubmit={save} className="space-y-3">
        <Textarea key={defaultValue} name="json" defaultValue={defaultValue} className="min-h-[520px] font-mono text-xs" />
        {message ? <p className="text-sm text-secondary">{message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button><Save className="h-4 w-4" /> Lưu</Button>
          <Link href={backHref}><Button type="button" variant="outline">Quay lại</Button></Link>
        </div>
      </form>
    </Card>
  );
}

function JsonPatchPanel({
  query,
  title,
  description,
  endpoint,
  template,
  method,
}: {
  query: ReturnType<typeof useLiveQuery<Record<string, unknown>>>;
  title: string;
  description: string;
  endpoint: string;
  template: unknown;
  method: 'POST' | 'PATCH';
}) {
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiFetch(endpoint, {
        method,
        headers: authHeaders(),
        body: String(new FormData(event.currentTarget).get('json')),
      });
      setMessage('Đã lưu cài đặt.');
      query.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không lưu được cài đặt');
    }
  }
  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <JsonBlock value={query.data} />
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Textarea name="json" defaultValue={pretty(template)} className="min-h-44 font-mono text-xs" />
        {message ? <p className="text-sm text-secondary">{message}</p> : null}
        <Button><Save className="h-4 w-4" /> Lưu</Button>
      </form>
    </Card>
  );
}

function DataGate<T>({
  query,
  children,
}: {
  query: ReturnType<typeof useLiveQuery<T>>;
  children: (data: T) => React.ReactNode;
}) {
  if (query.unauthenticated) return <AuthRequiredCard />;
  if (query.loading) return <LoadingCard />;
  if (query.error) return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!query.data || (Array.isArray(query.data) && !query.data.length)) {
    return <EmptyState title="Chưa có dữ liệu" description="Khi hệ thống có bản ghi thật, danh sách sẽ xuất hiện tại đây." />;
  }
  return <>{children(query.data)}</>;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-sm text-mutedText">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </Card>
  );
}

function optional(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || undefined;
}

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

const packageTemplate = {
  title: 'Frontend Intern 1-1',
  shortDescription: 'Lộ trình mentor 1-1 cho mục tiêu Frontend Intern.',
  longDescription: 'Gói học có mentor theo sát, bài tập theo tuần, luyện code, luyện phỏng vấn và cải thiện portfolio.',
  targetAudience: 'Học viên muốn ứng tuyển thực tập hoặc fresher frontend.',
  targetRole: 'Frontend Intern',
  level: 'FOUNDATION',
  category: 'FRONTEND',
  durationWeeks: 12,
  recommendedSessions: 12,
  sessionDurationMinutes: 60,
  outcomes: ['Hoàn thành portfolio', 'Nắm vững React cơ bản', 'Sẵn sàng phỏng vấn'],
  skills: ['JavaScript', 'React', 'API integration'],
  includedAiTools: ['AI Interview', 'AI Code Review', 'Resource Search'],
  mentorType: 'Frontend mentor',
  price: 499,
  currency: 'USD',
  status: 'PUBLISHED',
  featured: true,
  heroConfig: { accent: 'green' },
};

const resourceTemplate = {
  title: 'React Documentation',
  source: 'React',
  author: 'Meta',
  type: 'DOCUMENTATION',
  url: 'https://react.dev',
  description: 'Tài liệu chính thức để học React hiện đại.',
  difficulty: 'BEGINNER',
  category: 'Frontend',
  tags: ['react', 'frontend'],
  estimatedMinutes: 90,
  whyRecommended: 'Nguồn chính thống, dễ cập nhật theo phiên bản mới.',
  isCurated: true,
  status: 'PUBLISHED',
};

const codeProblemTemplate = {
  title: 'Two Sum',
  difficulty: 'EASY',
  category: 'Array',
  tags: ['array', 'hash-map'],
  statement: 'Given an array of integers nums and target, return indices of two numbers that add up to target.',
  inputFormat: 'First line target, second line comma-separated nums.',
  outputFormat: 'Two indices separated by space.',
  constraintsText: '2 <= nums.length <= 10000',
  examples: [{ input: '9\\n2,7,11,15', output: '0 1' }],
  starterCode: { JAVASCRIPT: 'function solve(input) {\\n  return input;\\n}' },
  solutionExplanation: 'Use a hash map from value to index.',
  timeLimitMs: 1000,
  memoryLimitMb: 128,
  status: 'PUBLISHED',
  testCases: [{ input: '9\\n2,7,11,15', expectedOutput: '0 1', isHidden: false, order: 1 }],
};

const interviewQuestionTemplate = {
  role: 'Frontend Intern',
  category: 'FRONTEND',
  level: 'Intern',
  question: 'Giải thích sự khác nhau giữa state và props trong React.',
  expectedPoints: ['State thuộc component', 'Props truyền từ ngoài vào', 'Cả hai đều ảnh hưởng render'],
  sampleAnswer: 'Props là dữ liệu truyền vào component, state là dữ liệu component tự quản lý.',
  commonMistakes: ['Nói state và props giống nhau', 'Không nhắc immutable update'],
  tags: ['react', 'frontend'],
  isActive: true,
};
