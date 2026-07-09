'use client';

import { FormEvent, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { authHeaders, apiFetch } from '@/lib/api';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function AiAssistantPage() {
  const [answer, setAnswer] = useState('Ask about your roadmap, package, coding problem, interview prep, quiz, flashcards or this week study plan.');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ message: string }>('/ai/chat', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message: form.get('message') }),
      });
      setAnswer(result.message);
    } catch (err) {
      setAnswer(err instanceof Error ? err.message : 'Assistant request failed');
    }
  }

  return (
    <DashboardShell title="AI Learning Assistant" subtitle="Context-aware help using your profile, roadmap, submissions and interview sessions.">
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Bot className="h-5 w-5 text-secondary" />
          <p className="text-sm text-slate-200">{answer}</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Textarea name="message" placeholder="What should I improve next this week?" required />
          <Button>
            <Send className="h-4 w-4" />
            Send
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
