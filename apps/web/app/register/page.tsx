'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          password: form.get('password'),
          targetRole: form.get('targetRole'),
        }),
      });
      window.localStorage.setItem('mentormind.accessToken', result.accessToken);
      router.push('/create-roadmap');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your student account</CardTitle>
            <CardDescription>Start with an AI draft, then let admin or mentor review it into a real plan.</CardDescription>
          </CardHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input name="fullName" placeholder="Your name" required />
            <Input name="email" type="email" placeholder="you@example.com" required />
            <Input name="targetRole" placeholder="Frontend Intern" />
            <Input name="password" type="password" placeholder="At least 8 characters" required />
            {error ? <p className="text-sm text-warning">{error}</p> : null}
            <Button className="w-full">Create account</Button>
            <p className="text-center text-sm text-mutedText">
              Already have an account? <Link className="text-secondary" href="/login">Login</Link>
            </p>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}
