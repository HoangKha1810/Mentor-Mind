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

const steps = ['Goal', 'Current level', 'Schedule', 'Career target', 'Uploads', 'AI draft'];

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
      currentSkills: String(form.get('currentSkills') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
      weakAreas: String(form.get('weakAreas') ?? '').split(',').map((item) => item.trim()).filter(Boolean),
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
          title: `${payload.targetRole} Personalized 1-on-1 Roadmap`,
          summary: 'Login to save this request and send it to admin review. This preview shows the mock AI flow.',
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
      setError(err instanceof Error ? err.message : 'Could not create roadmap');
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
            AI draft + admin review
          </Badge>
          <h1 className="mt-5 text-4xl font-semibold text-white">Create your custom learning roadmap</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">
            Tell us your goal, constraints and weak areas. AI drafts the first version, then admin or mentor turns it into a real 1-on-1 plan.
          </p>
          <div className="mt-8 space-y-2">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                  step === index ? 'border-secondary/60 bg-secondary/10 text-white' : 'border-white/8 bg-white/[0.03] text-mutedText'
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
            <CardTitle>{step === 5 ? 'AI draft result' : steps[step]}</CardTitle>
            <CardDescription>All details are editable later by admin or mentor during consultation.</CardDescription>
          </CardHeader>
          {step === 5 && result ? (
            <pre className="max-h-[520px] overflow-auto rounded-md border border-white/8 bg-black/20 p-4 text-xs leading-6 text-slate-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Textarea name="goal" placeholder="Goal: become frontend intern in 4 months..." required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input name="targetRole" placeholder="Target role" required />
                <Input name="currentLevel" placeholder="Current level" required />
                <Input name="currentSkills" placeholder="Current skills, comma separated" />
                <Input name="weakAreas" placeholder="Weak areas, comma separated" />
                <Input name="weeklyHours" type="number" defaultValue={8} placeholder="Hours per week" />
                <Input name="preferredSchedule" placeholder="Evenings, weekends..." required />
                <Input name="budgetRange" placeholder="$300-$800" required />
                <Input name="learningStyle" placeholder="Project-based, visual..." required />
              </div>
              <Textarea name="mentorPreference" placeholder="Preferred mentor style, CV/JD notes, portfolio context..." />
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <label className="flex items-center gap-2"><input type="checkbox" name="wantsInterviewPrep" /> Interview prep</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="wantsCodePractice" /> Code practice</label>
              </div>
              {error ? <p className="text-sm text-warning">{error}</p> : null}
              <Button disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Generate AI draft
              </Button>
            </form>
          )}
        </Card>
      </section>
    </PageShell>
  );
}
