'use client';

import { FormEvent, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { authHeaders, apiFetch } from '@/lib/api';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function AiAssistantPage() {
  const [answer, setAnswer] = useState(
    'Hỏi về lộ trình, gói học, bài code, luyện phỏng vấn, quiz, flashcard hoặc kế hoạch học tuần này.',
  );

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
      setAnswer(err instanceof Error ? err.message : 'Không thể gửi yêu cầu tới trợ lý AI');
    }
  }

  return (
    <DashboardShell
      title="Trợ lý học tập AI"
      subtitle="Hỗ trợ theo ngữ cảnh từ hồ sơ, lộ trình, bài nộp và lịch sử phỏng vấn của bạn."
    >
      <Card>
        <div className="mb-4 flex items-center gap-3">
          <Bot className="h-5 w-5 text-secondary" />
          <p className="text-sm text-slate-200">{answer}</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Textarea
            name="message"
            placeholder="Tuần này tôi nên cải thiện điều gì tiếp theo?"
            required
          />
          <Button>
            <Send className="h-4 w-4" />
            Gửi
          </Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
