'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, Target, UserRound } from 'lucide-react';
import { apiFetch, setAccessToken } from '@/lib/api';
import { AuthInput, AuthShell } from '@/components/auth/auth-shell';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';

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
      setAccessToken(result.accessToken);
      router.push('/create-roadmap');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    }
  }

  return (
    <AuthShell
      eyebrow="Bắt đầu với lộ trình AI"
      title="Tạo tài khoản học viên"
      subtitle="Cho MentorMind biết mục tiêu nghề nghiệp của bạn, sau đó AI và mentor sẽ giúp biến nó thành kế hoạch học thật."
      switchText="Đã có tài khoản?"
      switchLabel="Đăng nhập"
      switchHref="/login"
    >
      <form onSubmit={submit} className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl text-[#333]">Đăng ký</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Tạo hồ sơ học viên và tiếp tục sang bước tạo lộ trình.
          </p>
        </div>
        <div className="space-y-3">
          <AuthInput icon={UserRound} name="fullName" placeholder="Họ và tên" required />
          <AuthInput icon={Mail} name="email" type="email" placeholder="Email" required />
          <AuthInput icon={Target} name="targetRole" placeholder="Vai trò mục tiêu" />
          <AuthInput
            icon={LockKeyhole}
            name="password"
            type="password"
            placeholder="Mật khẩu tối thiểu 8 ký tự"
            required
          />
        </div>
        <FormMessage message={error} />
        <Button className="mt-6 h-[50px] w-full">Tạo tài khoản</Button>
      </form>
    </AuthShell>
  );
}
