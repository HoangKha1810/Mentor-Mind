'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PageShell } from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ accessToken: string; user: { role: string } }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: form.get('email'),
            password: form.get('password'),
          }),
        },
      );
      window.localStorage.setItem('mentormind.accessToken', result.accessToken);
      router.push(
        result.user.role === 'ADMIN' || result.user.role === 'SUPER_ADMIN'
          ? '/admin'
          : result.user.role === 'MENTOR'
            ? '/mentor'
            : '/dashboard',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  }

  return (
    <PageShell>
      <section className="mx-auto flex max-w-md px-4 py-16">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Chào mừng bạn quay lại</CardTitle>
            <CardDescription>
              Truy cập không gian học tập, lịch học, lộ trình và các công cụ AI của bạn.
            </CardDescription>
          </CardHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input name="email" type="email" placeholder="student@mentormind.ai" required />
            <Input name="password" type="password" placeholder="Mật khẩu" required />
            {error ? <p className="text-sm text-warning">{error}</p> : null}
            <Button className="w-full">Đăng nhập</Button>
            <p className="text-center text-sm text-mutedText">
              Chưa có tài khoản?{' '}
              <Link className="text-secondary" href="/register">
                Tạo tài khoản
              </Link>
            </p>
          </form>
        </Card>
      </section>
    </PageShell>
  );
}
