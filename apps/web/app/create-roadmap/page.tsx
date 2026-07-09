'use client';

import { FormEvent, useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { authHeaders, apiFetch, getAccessToken } from '@/lib/api';
import { PageShell } from '@/components/layout/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const steps = [
  'Mục tiêu',
  'Trình độ hiện tại',
  'Lịch học',
  'Mục tiêu nghề nghiệp',
  'Tài liệu',
  'Bản nháp AI',
];

export default function CreateRoadmapPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const payload = {
      goal: form.get('goal'),
      targetRole: form.get('targetRole'),
      currentLevel: form.get('currentLevel'),
      currentSkills: String(form.get('currentSkills') ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      weakAreas: String(form.get('weakAreas') ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      weeklyHours: Number(form.get('weeklyHours') ?? 8),
      preferredSchedule: form.get('preferredSchedule'),
      budgetRange: form.get('budgetRange'),
      learningStyle: form.get('learningStyle'),
      mentorPreference: form.get('mentorPreference'),
      wantsOneOnOneTutoring: true,
      wantsInterviewPrep: form.get('wantsInterviewPrep') === 'on',
      wantsCodePractice: form.get('wantsCodePractice') === 'on',
    };

    try {
      if (!getAccessToken()) {
        setResult({
          title: `Lộ trình 1-1 cá nhân hóa cho ${payload.targetRole}`,
          summary:
            'Đăng nhập để lưu lộ trình, gửi yêu cầu tư vấn và nhận phản hồi từ đội ngũ MentorMind.',
        });
        setStep(5);
        return;
      }
      const request = await apiFetch<{ id: string }>('/roadmap-requests', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const draft = await apiFetch(`/roadmap-requests/${request.id}/generate-ai-draft`, {
        method: 'POST',
        headers: authHeaders(),
      });
      setResult(draft);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lộ trình');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <Badge className="text-secondary">
            <BrainCircuit className="mr-2 h-3.5 w-3.5" />
            AI phác thảo + admin duyệt
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white">Tạo lộ trình học cá nhân hóa</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Cho MentorMind biết mục tiêu, giới hạn thời gian và điểm yếu của bạn. AI phác thảo bản
            đầu tiên, sau đó admin hoặc mentor chuyển thành kế hoạch học 1-1 thật.
          </p>
          <div className="mt-8 space-y-2">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                  step === index
                    ? 'border-secondary/60 bg-secondary/10 text-white'
                    : 'border-white/8 bg-white/[0.03] text-mutedText'
                }`}
              >
                <span>{label}</span>
                <span>0{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{step === 5 ? 'Kết quả bản nháp AI' : steps[step]}</CardTitle>
            <CardDescription>
              Mọi chi tiết có thể được admin hoặc mentor chỉnh lại trong buổi tư vấn.
            </CardDescription>
          </CardHeader>
          {step === 5 && result ? (
            <pre className="max-h-[520px] overflow-auto rounded-md border border-white/8 bg-black/20 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Textarea
                name="goal"
                placeholder="Mục tiêu: trở thành Frontend Intern trong 4 tháng..."
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="targetRole" placeholder="Vai trò mục tiêu" required />
                <Input name="currentLevel" placeholder="Trình độ hiện tại" required />
                <Input
                  name="currentSkills"
                  placeholder="Kỹ năng hiện có, cách nhau bằng dấu phẩy"
                />
                <Input name="weakAreas" placeholder="Điểm yếu, cách nhau bằng dấu phẩy" />
                <Input
                  name="weeklyHours"
                  type="number"
                  defaultValue={8}
                  placeholder="Số giờ mỗi tuần"
                />
                <Input name="preferredSchedule" placeholder="Buổi tối, cuối tuần..." required />
                <Input name="budgetRange" placeholder="$300-$800" required />
                <Input name="learningStyle" placeholder="Học qua dự án, trực quan..." required />
              </div>
              <Textarea
                name="mentorPreference"
                placeholder="Phong cách mentor mong muốn, ghi chú CV/JD, bối cảnh portfolio..."
              />
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="wantsInterviewPrep" /> Luyện phỏng vấn
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="wantsCodePractice" /> Luyện code
                </label>
              </div>
              {error ? <p className="text-sm text-warning">{error}</p> : null}
              <Button disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Tạo bản nháp AI
              </Button>
            </form>
          )}
        </Card>
      </section>
    </PageShell>
  );
}
