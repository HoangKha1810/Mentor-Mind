'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordFallback() {
  return (
    <AuthShell
      eyebrow="Bảo mật tài khoản"
      title="Tạo mật khẩu mới"
      subtitle="Đang kiểm tra link đặt lại mật khẩu an toàn."
      switchText="Đã có mật khẩu mới?"
      switchLabel="Đăng nhập"
      switchHref="/login"
    >
      <div className="mx-auto w-full max-w-sm" role="status" aria-live="polite">
        <span className="sr-only">Đang tải form đặt lại mật khẩu...</span>
        <Skeleton className="mx-auto mb-8 h-7 w-52" />
        <Skeleton className="h-[50px] rounded-full" />
        <Skeleton className="mt-3 h-[50px] rounded-full" />
        <Skeleton className="mt-6 h-[50px] rounded-full" />
      </div>
    </AuthShell>
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
          <h2 className="font-display text-2xl text-foreground">Đặt lại mật khẩu</h2>
          <p className="mt-3 text-sm leading-6 text-mutedText">
            Mật khẩu tối thiểu 8 ký tự. Link reset chỉ dùng được một lần.
          </p>
        </div>
        {!token ? (
          <FormMessage message="Link đặt lại mật khẩu không hợp lệ hoặc thiếu token." />
        ) : (
          <>
            <div className="space-y-3">
              <AuthInput
                icon={LockKeyhole}
                label="Mật khẩu mới"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Mật khẩu mới"
                required
              />
              <AuthInput
                icon={LockKeyhole}
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
            <FormMessage message={message} tone="success" />
            <FormMessage message={error} />
            <Button className="mt-6 h-[50px] w-full" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
            </Button>
          </>
        )}
        <p className="mt-5 text-center text-xs leading-6 text-mutedText">
          Link hết hạn?{' '}
          <Link
            href="/forgot-password"
            className="rounded-sm font-medium text-foreground/75 outline-none transition hover:text-success focus-visible:ring-2 focus-visible:ring-success/60"
          >
            Gửi lại link reset
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
