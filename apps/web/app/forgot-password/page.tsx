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
          <h2 className="font-display text-2xl text-[#333]">Quên mật khẩu</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Link reset sẽ được gửi từ support@mentormind.center và hết hạn sau 30 phút.
          </p>
        </div>
        <AuthInput icon={Mail} name="email" type="email" placeholder="Email tài khoản" required />
        {message ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}
        <Button className="mt-6 h-[50px] w-full" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
        </Button>
        <p className="mt-5 text-center text-xs leading-6 text-slate-400">
          Cần hỗ trợ?{' '}
          <Link
            href="mailto:support@mentormind.center"
            className="font-medium text-slate-600 transition hover:text-[#57b846]"
          >
            support@mentormind.center
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
