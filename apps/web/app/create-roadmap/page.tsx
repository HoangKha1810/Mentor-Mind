'use client';

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { sampleRoadmapTemplates } from '@mentormind/shared';
import { authHeaders, apiFetch, ensureAccessToken } from '@/lib/api';
import { motionDistance, motionDuration, motionEase } from '@/lib/motion-system';
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

type RoadmapTemplate = (typeof sampleRoadmapTemplates)[number];
type WizardDirection = -1 | 1;

type RoadmapFormDraft = {
  goal: string;
  targetRole: string;
  currentLevel: string;
  currentSkills: string;
  weakAreas: string;
  weeklyHours: string;
  preferredSchedule: string;
  budgetRange: string;
  learningStyle: string;
  mentorPreference: string;
  wantsInterviewPrep: boolean;
  wantsCodePractice: boolean;
};

type WizardMotionContext = {
  direction: WizardDirection;
  reduceMotion: boolean;
};

const wizardPanelVariants = {
  enter: ({ direction, reduceMotion }: WizardMotionContext) =>
    reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * motionDistance.reveal },
  active: { opacity: 1, x: 0 },
  exit: ({ direction, reduceMotion }: WizardMotionContext) =>
    reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * -motionDistance.reveal },
};

export default function CreateRoadmapPage() {
  return (
    <Suspense fallback={<CreateRoadmapFallback />}>
      <CreateRoadmapContent />
    </Suspense>
  );
}

function CreateRoadmapFallback() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Đang tải form lộ trình...</CardTitle>
            <CardDescription>MentorMind đang chuẩn bị dữ liệu mẫu phù hợp.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </PageShell>
  );
}

function CreateRoadmapContent() {
  const searchParams = useSearchParams();
  const selectedTemplate = sampleRoadmapTemplates.find(
    (template) => template.slug === searchParams.get('template'),
  );
  const reduceMotion = Boolean(useReducedMotion());
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<WizardDirection>(1);
  const [formDraft, setFormDraft] = useState<RoadmapFormDraft>(() =>
    createInitialFormDraft(selectedTemplate),
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (step === 5 && result) resultRef.current?.focus();
  }, [result, step]);

  function goToStep(nextStep: number) {
    if (nextStep === step) return;
    if (formRef.current) setFormDraft(readFormDraft(formRef.current));
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFormDraft(readFormDraft(event.currentTarget));
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
      if (!(await ensureAccessToken())) {
        setError('Vui lòng đăng nhập để AI tạo và lưu bản nháp lộ trình thật của bạn.');
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
      setDirection(1);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lộ trình');
    } finally {
      setLoading(false);
    }
  }

  const wizardMotionContext: WizardMotionContext = { direction, reduceMotion };
  const wizardTransition = {
    duration: reduceMotion ? 0 : motionDuration.standard,
    ease: motionEase.standard,
  };

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl items-start gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
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
          {selectedTemplate ? (
            <div className="mt-6 rounded-lg border border-secondary/25 bg-secondary/8 p-4">
              <p className="text-sm font-semibold text-secondary">Đang dùng mẫu</p>
              <p className="mt-2 text-sm font-medium text-white">{selectedTemplate.title}</p>
              <p className="mt-2 text-sm leading-6 text-mutedText">{selectedTemplate.summary}</p>
            </div>
          ) : null}
          <div
            className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1"
            role="group"
            aria-label="Các phần của form tạo lộ trình"
          >
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                aria-current={step === index ? 'step' : undefined}
                onClick={() => goToStep(index)}
                className={`relative isolate flex min-h-12 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border px-3 py-2 text-left text-sm transition-colors duration-200 ${
                  step === index
                    ? 'border-transparent text-white'
                    : 'border-white/8 bg-white/[0.03] text-mutedText hover:border-white/15 hover:text-foreground'
                }`}
              >
                {step === index ? (
                  <motion.span
                    layoutId="create-roadmap-active-step"
                    className="absolute inset-0 -z-10 rounded-md border border-secondary/60 bg-secondary/10"
                    transition={wizardTransition}
                  />
                ) : null}
                <span className="relative min-w-0 leading-5">{label}</span>
                <span className="relative shrink-0 tabular-nums">0{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="min-w-0">
          <AnimatePresence initial={false} mode="wait" custom={wizardMotionContext}>
            {step === 5 && result ? (
              <motion.div
                ref={resultRef}
                key="roadmap-result"
                role="region"
                aria-labelledby="roadmap-result-title"
                tabIndex={-1}
                custom={wizardMotionContext}
                variants={wizardPanelVariants}
                initial="enter"
                animate="active"
                exit="exit"
                transition={wizardTransition}
              >
                <CardHeader>
                  <CardTitle id="roadmap-result-title">Kết quả bản nháp AI</CardTitle>
                  <CardDescription>
                    Mọi chi tiết có thể được admin hoặc mentor chỉnh lại trong buổi tư vấn.
                  </CardDescription>
                </CardHeader>
                <p className="sr-only" role="status" aria-live="polite">
                  Bản nháp lộ trình AI đã được tạo thành công.
                </p>
                <pre className="max-h-[520px] overflow-auto rounded-md border border-white/8 bg-black/20 p-4 text-xs leading-6 text-slate-200">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </motion.div>
            ) : (
              <motion.div
                key={`roadmap-form-${step}`}
                custom={wizardMotionContext}
                variants={wizardPanelVariants}
                initial="enter"
                animate="active"
                exit="exit"
                transition={wizardTransition}
              >
                <CardHeader>
                  <CardTitle>{step === 5 ? 'Kết quả bản nháp AI' : steps[step]}</CardTitle>
                  <CardDescription>
                    Mọi chi tiết có thể được admin hoặc mentor chỉnh lại trong buổi tư vấn.
                  </CardDescription>
                </CardHeader>
                <form ref={formRef} onSubmit={submit} className="space-y-4">
                  <label htmlFor="roadmap-goal" className="block space-y-2 text-sm font-medium">
                    <span>Mục tiêu học tập</span>
                    <Textarea
                      id="roadmap-goal"
                      name="goal"
                      placeholder="Ví dụ: trở thành Frontend Intern trong 4 tháng..."
                      defaultValue={formDraft.goal}
                      required
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <RoadmapField label="Vai trò mục tiêu" htmlFor="roadmap-target-role">
                      <Input
                        id="roadmap-target-role"
                        name="targetRole"
                        placeholder="Ví dụ: AI Research Intern"
                        defaultValue={formDraft.targetRole}
                        required
                      />
                    </RoadmapField>
                    <RoadmapField label="Trình độ hiện tại" htmlFor="roadmap-current-level">
                      <Input
                        id="roadmap-current-level"
                        name="currentLevel"
                        placeholder="Ví dụ: Foundation"
                        defaultValue={formDraft.currentLevel}
                        required
                      />
                    </RoadmapField>
                    <RoadmapField label="Kỹ năng hiện có" htmlFor="roadmap-current-skills">
                      <Input
                        id="roadmap-current-skills"
                        name="currentSkills"
                        placeholder="Cách nhau bằng dấu phẩy"
                        defaultValue={formDraft.currentSkills}
                      />
                    </RoadmapField>
                    <RoadmapField label="Điểm cần cải thiện" htmlFor="roadmap-weak-areas">
                      <Input
                        id="roadmap-weak-areas"
                        name="weakAreas"
                        placeholder="Cách nhau bằng dấu phẩy"
                        defaultValue={formDraft.weakAreas}
                      />
                    </RoadmapField>
                    <RoadmapField label="Số giờ mỗi tuần" htmlFor="roadmap-weekly-hours">
                      <Input
                        id="roadmap-weekly-hours"
                        name="weeklyHours"
                        type="number"
                        min={1}
                        defaultValue={formDraft.weeklyHours}
                        placeholder="8"
                      />
                    </RoadmapField>
                    <RoadmapField label="Lịch học phù hợp" htmlFor="roadmap-schedule">
                      <Input
                        id="roadmap-schedule"
                        name="preferredSchedule"
                        placeholder="Buổi tối, cuối tuần..."
                        defaultValue={formDraft.preferredSchedule}
                        required
                      />
                    </RoadmapField>
                    <RoadmapField label="Ngân sách dự kiến" htmlFor="roadmap-budget">
                      <Input
                        id="roadmap-budget"
                        name="budgetRange"
                        placeholder="$300-$800"
                        defaultValue={formDraft.budgetRange}
                        required
                      />
                    </RoadmapField>
                    <RoadmapField label="Phong cách học" htmlFor="roadmap-learning-style">
                      <Input
                        id="roadmap-learning-style"
                        name="learningStyle"
                        placeholder="Học qua dự án, trực quan..."
                        defaultValue={formDraft.learningStyle}
                        required
                      />
                    </RoadmapField>
                  </div>
                  <label
                    htmlFor="roadmap-mentor-preference"
                    className="block space-y-2 text-sm font-medium"
                  >
                    <span>Mentor và bối cảnh bổ sung</span>
                    <Textarea
                      id="roadmap-mentor-preference"
                      name="mentorPreference"
                      placeholder="Phong cách mentor mong muốn, ghi chú CV/JD, bối cảnh portfolio..."
                      defaultValue={formDraft.mentorPreference}
                    />
                  </label>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="wantsInterviewPrep"
                        defaultChecked={formDraft.wantsInterviewPrep}
                      />{' '}
                      Luyện phỏng vấn
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="wantsCodePractice"
                        defaultChecked={formDraft.wantsCodePractice}
                      />{' '}
                      Luyện code
                    </label>
                  </div>
                  {error ? (
                    <p role="alert" className="text-sm text-warning">
                      {error}
                    </p>
                  ) : null}
                  <Button disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Tạo bản nháp AI
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>
    </PageShell>
  );
}

function RoadmapField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function createInitialFormDraft(template?: RoadmapTemplate): RoadmapFormDraft {
  return {
    goal: template
      ? `${template.summary}\n\nKết quả mong muốn: ${template.outcomes.join('; ')}`
      : '',
    targetRole: template?.targetRole ?? '',
    currentLevel: template?.level ?? '',
    currentSkills: template ? 'Python cơ bản, tư duy sản phẩm, tự học AI' : '',
    weakAreas: template ? 'Triển khai thực tế, đánh giá mô hình, trình bày dự án' : '',
    weeklyHours: String(template?.weeklyHours ?? 8),
    preferredSchedule: template ? '2-3 buổi mỗi tuần, ưu tiên buổi tối hoặc cuối tuần' : '',
    budgetRange: template ? 'Trao đổi theo gói học phù hợp' : '',
    learningStyle: template ? 'Học theo dự án, mentor review và demo sau mỗi chặng' : '',
    mentorPreference: template
      ? `Bám theo mẫu "${template.title}" từ ${template.sourceFile}. Các buổi chính: ${template.lessons
          .map((lesson) => lesson.title)
          .join('; ')}.`
      : '',
    wantsInterviewPrep: false,
    wantsCodePractice: false,
  };
}

function readFormDraft(form: HTMLFormElement): RoadmapFormDraft {
  const data = new FormData(form);
  return {
    goal: String(data.get('goal') ?? ''),
    targetRole: String(data.get('targetRole') ?? ''),
    currentLevel: String(data.get('currentLevel') ?? ''),
    currentSkills: String(data.get('currentSkills') ?? ''),
    weakAreas: String(data.get('weakAreas') ?? ''),
    weeklyHours: String(data.get('weeklyHours') ?? ''),
    preferredSchedule: String(data.get('preferredSchedule') ?? ''),
    budgetRange: String(data.get('budgetRange') ?? ''),
    learningStyle: String(data.get('learningStyle') ?? ''),
    mentorPreference: String(data.get('mentorPreference') ?? ''),
    wantsInterviewPrep: data.get('wantsInterviewPrep') === 'on',
    wantsCodePractice: data.get('wantsCodePractice') === 'on',
  };
}
