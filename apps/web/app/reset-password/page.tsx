'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '');
    const confirmPassword = String(form.get('confirmPassword') ?? '');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.');
      setLoading(false);
      return;
    }

    try {
      const result = await apiFetch<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Bảo mật tài khoản"
      title="Tạo mật khẩu mới"
      subtitle="Chọn mật khẩu mới mạnh hơn. Sau khi đổi mật khẩu, các phiên đăng nhập cũ sẽ bị vô hiệu."
      switchText="Đã có mật khẩu mới?"
      switchLabel="Đăng nhập"
      switchHref="/login"
    >
      <form onSubmit={submit} className="mx-auto w-full max-w-sm">
        <div className="mb-9 text-center">
          <h2 className="font-display text-2xl text-[#333]">Đặt lại mật khẩu</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Mật khẩu tối thiểu 8 ký tự. Link reset chỉ dùng được một lần.
          </p>
        </div>
        {!token ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            Link đặt lại mật khẩu không hợp lệ hoặc thiếu token.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <AuthInput
                icon={LockKeyhole}
                name="password"
                type="password"
                minLength={8}
                placeholder="Mật khẩu mới"
                required
              />
              <AuthInput
                icon={LockKeyhole}
                name="confirmPassword"
                type="password"
                minLength={8}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            {message ? (
              <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            ) : null}
            <Button className="mt-6 h-[50px] w-full" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
            </Button>
          </>
        )}
        <p className="mt-5 text-center text-xs leading-6 text-slate-400">
          Link hết hạn?{' '}
          <Link href="/forgot-password" className="font-medium text-slate-600 transition hover:text-[#57b846]">
            Gửi lại link reset
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
