'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email') }),
      });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được email đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Khôi phục tài khoản"
      title="Đặt lại mật khẩu"
      subtitle="Nhập email tài khoản MentorMind, hệ thống sẽ gửi link đặt lại mật khẩu nếu email tồn tại."
      switchText="Đã nhớ mật khẩu?"
      switchLabel="Đăng nhập"
      switchHref="/login"
    >
      <form onSubmit={submit} className="mx-auto w-full max-w-sm">
        <div className="mb-9 text-center">
          <h2 className="font-display text-2xl text-foreground">Quên mật khẩu</h2>
          <p className="mt-3 text-sm leading-6 text-mutedText">
            Link reset sẽ được gửi từ support@mentormind.center và hết hạn sau 30 phút.
          </p>
        </div>
        <AuthInput
          icon={Mail}
          label="Email tài khoản"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="ban@example.com"
          required
        />
        {message ? (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
          >
            {message}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-500/25 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:bg-danger/10 dark:text-red-200"
          >
            {error}
          </p>
        ) : null}
        <Button className="mt-6 h-[50px] w-full" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </Button>
        <p className="mt-5 text-center text-xs leading-6 text-mutedText">
          Cần hỗ trợ?{' '}
          <Link
            href="mailto:support@mentormind.center"
            className="rounded-sm font-medium text-foreground/75 outline-none transition hover:text-success focus-visible:ring-2 focus-visible:ring-success/60"
          >
            support@mentormind.center
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
