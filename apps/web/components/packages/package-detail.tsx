'use client';

import { FormEvent, useState } from 'react';
import { formatCurrency, toCurrencyNumber } from '@mentormind/shared';
import { CreditCard, Send } from 'lucide-react';
import { apiFetch, authHeaders, ensureAccessToken } from '@/lib/api';
import { PackageItem, WalletSummary } from '@/lib/domain-types';
import { packageCategoryLabel, packageLevelLabel } from '@/lib/labels';
import { useLiveQuery } from '@/lib/live-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState, ErrorCard, LoadingCard } from '@/components/dashboard/live-common';

type PackageDetailResponse = PackageItem & {
  related?: PackageItem[];
};

type PurchasePackageResponse = {
  wallet: WalletSummary;
};

export function PackageDetail({
  slug,
  initialData,
}: {
  slug: string;
  initialData?: PackageDetailResponse;
}) {
  const query = useLiveQuery<PackageDetailResponse>(`/packages/${slug}`, { deps: [slug] });
  const packageData = query.data ?? initialData;
  const [message, setMessage] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  async function requestConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!packageData) return;
    if (!(await ensureAccessToken())) {
      setMessage('Vui lòng đăng nhập để gửi yêu cầu tư vấn.');
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await apiFetch(`/packages/${packageData.id}/request-consultation`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ message: form.get('message') }),
      });
      setMessage('Đã gửi yêu cầu tư vấn. Trạng thái sẽ được theo dõi trong hệ thống.');
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không gửi được yêu cầu tư vấn');
    }
  }

  async function purchaseWithWallet() {
    if (!packageData || purchasing) return;
    if (!(await ensureAccessToken())) {
      setMessage('Vui lòng đăng nhập để mua gói học bằng số dư.');
      return;
    }
    const price = toCurrencyNumber(packageData.price);
    if (
      price > 0 &&
      !window.confirm(
        `Mua gói "${packageData.title}" sẽ trừ ${formatCurrency(price, packageData.currency)} từ ví của bạn. Bạn muốn tiếp tục?`,
      )
    ) {
      return;
    }

    setPurchasing(true);
    setMessage('');
    try {
      const result = await apiFetch<PurchasePackageResponse>('/payments/wallet/purchase-package', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ packageId: packageData.id }),
      });
      window.dispatchEvent(
        new CustomEvent('mentormind:wallet-updated', { detail: { wallet: result.wallet } }),
      );
      setMessage('Đã mua gói học bằng số dư ví. Số dư đã được cập nhật.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không mua được gói học bằng số dư');
    } finally {
      setPurchasing(false);
    }
  }

  if (query.loading && !packageData) return <LoadingCard label="Đang tải chi tiết gói học..." />;
  if (query.error && !packageData)
    return <ErrorCard message={query.error} onRetry={query.reload} />;
  if (!packageData) {
    return (
      <EmptyState
        title="Không tìm thấy gói học"
        description="Gói học này chưa được publish hoặc đã bị lưu trữ."
      />
    );
  }

  const outcomes = toStringArray(packageData.outcomes);
  const skills = toStringArray(packageData.skills);
  const tools = toStringArray(packageData.includedAiTools);
  const packagePrice = toCurrencyNumber(packageData.price);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>{packageCategoryLabel(packageData.category)}</Badge>
          <Badge>{packageLevelLabel(packageData.level)}</Badge>
          <Badge>{packageData.durationWeeks} tuần</Badge>
        </div>
        <CardHeader>
          <CardTitle>{packageData.title}</CardTitle>
          <CardDescription>
            {packageData.longDescription ?? packageData.shortDescription}
          </CardDescription>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Vai trò mục tiêu" value={packageData.targetRole} />
          <Info label="Mentor" value={packageData.mentorType} />
          <Info label="Số buổi đề xuất" value={`${packageData.recommendedSessions} buổi`} />
          <Info label="Thời lượng mỗi buổi" value={`${packageData.sessionDurationMinutes} phút`} />
        </div>
        <Section title="Kết quả đầu ra" items={outcomes} />
        <Section title="Kỹ năng trọng tâm" items={skills} />
        <Section title="Công cụ AI đi kèm" items={tools} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formatCurrency(packagePrice, packageData.currency)}</CardTitle>
          <CardDescription>
            Gửi yêu cầu tư vấn để đội ngũ xác nhận mục tiêu và lịch học.
          </CardDescription>
        </CardHeader>
        <form onSubmit={requestConsultation} className="space-y-4">
          <Textarea
            name="message"
            placeholder="Mục tiêu, deadline, nền tảng hiện tại và khung giờ mong muốn"
            required
          />
          {message ? <p className="text-sm text-secondary">{message}</p> : null}
          <div className="grid gap-2">
            <Button
              type="button"
              className="w-full"
              disabled={purchasing}
              onClick={purchaseWithWallet}
            >
              <CreditCard className="h-4 w-4" />
              {purchasing ? 'Đang mua...' : 'Mua bằng số dư'}
            </Button>
            <Button variant="outline" className="w-full">
              <Send className="h-4 w-4" />
              Gửi yêu cầu tư vấn
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/8 bg-white/[0.03] p-3">
      <p className="text-xs text-mutedText">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm font-medium text-white">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item}>{item}</Badge>
        ))}
      </div>
    </div>
  );
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}
