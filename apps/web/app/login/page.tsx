'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

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
    <AuthShell
      eyebrow="Không gian học tập cá nhân"
      title="Chào mừng bạn quay lại"
      subtitle="Truy cập lộ trình, lịch học, bài code, phỏng vấn AI và hồ sơ học tập được đồng bộ theo tài khoản của bạn."
      switchText="Chưa có tài khoản?"
      switchLabel="Tạo tài khoản"
      switchHref="/register"
    >
      <form onSubmit={submit} className="mx-auto w-full max-w-sm">
        <div className="mb-9 text-center">
          <h2 className="font-display text-2xl text-[#333]">Đăng nhập</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Tiếp tục hành trình học 1-1 cùng MentorMind.
          </p>
        </div>
        <div className="space-y-3">
          <AuthInput icon={Mail} name="email" type="email" placeholder="Email" required />
          <AuthInput icon={LockKeyhole} name="password" type="password" placeholder="Mật khẩu" required />
        </div>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}
        <Button className="mt-6 h-[50px] w-full">Đăng nhập</Button>
        <p className="mt-5 text-center text-xs leading-6 text-slate-400">
          Quên mật khẩu?{' '}
          <Link href="mailto:support@mentormind.center" className="font-medium text-slate-600 transition hover:text-[#57b846]">
            Liên hệ hỗ trợ
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
