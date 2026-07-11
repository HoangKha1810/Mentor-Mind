'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { apiFetch, setAccessToken } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

type LoginResponse =
  | {
      accessToken: string;
      user: { role: string };
      requiresTwoFactor?: false;
    }
  | {
      requiresTwoFactor: true;
      challengeId: string;
      email: string;
      expiresAt: string;
    };

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [twoFactor, setTwoFactor] = useState<Extract<
    LoginResponse,
    { requiresTwoFactor: true }
  > | null>(null);

  function routeAfterLogin(role: string) {
    router.push(
      role === 'ADMIN' || role === 'SUPER_ADMIN'
        ? '/admin'
        : role === 'MENTOR'
          ? '/mentor'
          : '/dashboard',
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password'),
        }),
      });
      if (result.requiresTwoFactor) {
        setTwoFactor(result);
        return;
      }
      setAccessToken(result.accessToken);
      routeAfterLogin(result.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    }
  }

  async function verifyAdminTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!twoFactor) return;
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await apiFetch<{ accessToken: string; user: { role: string } }>(
        '/auth/login/verify-admin-2fa',
        {
          method: 'POST',
          body: JSON.stringify({
            challengeId: twoFactor.challengeId,
            code: String(form.get('code') ?? '').trim(),
          }),
        },
      );
      setAccessToken(result.accessToken);
      routeAfterLogin(result.user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực admin thất bại');
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
      {twoFactor ? (
        <form onSubmit={verifyAdminTwoFactor} className="mx-auto w-full max-w-sm">
          <div className="mb-9 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#57b846]/12 text-[#57b846]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl text-[#333]">Xác thực admin</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Mã 6 số đã được gửi tới {twoFactor.email}. Mã hết hạn lúc{' '}
              {new Date(twoFactor.expiresAt).toLocaleTimeString('vi-VN')}.
            </p>
          </div>
          <AuthInput
            icon={ShieldCheck}
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="Nhập mã 6 số"
            required
          />
          <FormMessage message={error} />
          <Button className="mt-6 h-[50px] w-full">Xác thực và vào Admin</Button>
          <button
            type="button"
            onClick={() => {
              setTwoFactor(null);
              setError('');
            }}
            className="mt-4 w-full text-center text-sm font-semibold text-slate-500 transition hover:text-[#57b846]"
          >
            Đăng nhập lại
          </button>
        </form>
      ) : (
        <form onSubmit={submit} className="mx-auto w-full max-w-sm">
          <div className="mb-9 text-center">
            <h2 className="font-display text-2xl text-[#333]">Đăng nhập</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tiếp tục hành trình học 1-1 cùng MentorMind.
            </p>
          </div>
          <div className="space-y-3">
            <AuthInput icon={Mail} name="email" type="email" placeholder="Email" required />
            <AuthInput
              icon={LockKeyhole}
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
            />
          </div>
          <FormMessage message={error} />
          <Button className="mt-6 h-[50px] w-full">Đăng nhập</Button>
          <p className="mt-5 text-center text-xs leading-6 text-slate-400">
            Quên mật khẩu?{' '}
            <Link
              href="/forgot-password"
              className="font-medium text-slate-600 transition hover:text-[#57b846]"
            >
              Đặt lại mật khẩu
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
