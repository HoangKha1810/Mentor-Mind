import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { EntitlementsService, walletCurrency } from '../entitlements/entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentProvider } from './payment-provider.interface';

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

const createPaymentSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default('VND'),
  description: z.string().min(1).max(25).default('MentorMind AI'),
  packageId: z.string().optional(),
  roadmapId: z.string().optional(),
});

const topUpSchema = z.object({
  amount: z.number().int().min(10_000).max(100_000_000),
});

const purchasePackageSchema = z.object({
  packageId: z.string().min(1),
});

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async createPaymentLink(studentId: string, input: unknown) {
    const body = createPaymentSchema.parse(input);
    return this.createPaymentIntent(studentId, body);
  }

  async wallet(studentId: string) {
    return this.entitlements.walletSummary(studentId);
  }

  plans() {
    return this.entitlements.plans();
  }

  entitlementsSummary(studentId: string) {
    return this.entitlements.summary(studentId);
  }

  purchaseSubscription(studentId: string, slug: string) {
    return this.entitlements.purchaseSubscription(studentId, slug);
  }

  async createTopUpLink(studentId: string, input: unknown) {
    const body = topUpSchema.parse(input);
    return this.createPaymentIntent(studentId, {
      amount: body.amount,
      currency: walletCurrency,
      description: 'Nap MentorMind',
    });
  }

  async purchasePackage(studentId: string, input: unknown) {
    const body = purchasePackageSchema.parse(input);
    const pack = await this.prisma.tutoringPackage.findUnique({ where: { id: body.packageId } });
    if (!pack || pack.status !== 'PUBLISHED') {
      throw new NotFoundException('Package not found');
    }
    if (pack.currency !== walletCurrency) {
      throw new BadRequestException(
        `Ví hiện chỉ thanh toán bằng ${walletCurrency}. Vui lòng đổi gói học sang ${walletCurrency}.`,
      );
    }

    const price = Number(pack.price);
    const wallet = await this.entitlements.walletSummary(studentId);
    if (wallet.balance < price) {
      throw new BadRequestException('Số dư không đủ để mua gói học này. Vui lòng nạp thêm tiền.');
    }

    const payment = await this.prisma.payment.create({
      data: {
        studentId,
        packageId: pack.id,
        amount: price,
        currency: walletCurrency,
        status: PaymentStatus.PAID,
        provider: 'wallet',
        providerRef: `wallet_${Date.now()}`,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'PAYMENT_STATUS',
        title: 'Đã mua gói học',
        message: `Bạn đã mua gói "${pack.title}" bằng số dư ví.`,
        metadata: { paymentId: payment.id, packageId: pack.id } as Prisma.InputJsonValue,
      },
    });

    return {
      payment,
      wallet: await this.entitlements.walletSummary(studentId),
      entitlements: await this.entitlements.summary(studentId),
    };
  }

  private async createPaymentIntent(studentId: string, body: z.infer<typeof createPaymentSchema>) {
    const user = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const orderCode = Date.now();
    const returnUrl =
      process.env.PAYOS_RETURN_URL || 'http://localhost:3000/dashboard/payments/success';
    const cancelUrl =
      process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/dashboard/payments/cancel';
    const intent = await this.provider.createIntent({
      amount: body.amount,
      currency: body.currency,
      description: body.description,
      returnUrl,
      cancelUrl,
      metadata: {
        orderCode: String(orderCode),
        studentId,
        fullName: user.fullName,
        email: user.email,
      },
    });

    const payment = await this.prisma.payment.create({
      data: {
        studentId,
        packageId: body.packageId,
        roadmapId: body.roadmapId,
        amount: body.amount,
        currency: body.currency,
        status: intent.status as PaymentStatus,
        provider: intent.provider,
        providerRef: intent.providerRef,
      },
    });

    return { payment, checkoutUrl: intent.checkoutUrl, providerResponse: intent.raw };
  }

  async handleWebhook(payload: unknown) {
    const intent = await this.provider.verifyWebhook(payload);
    const payment = await this.prisma.payment.findFirst({
      where: { provider: intent.provider, providerRef: intent.providerRef },
    });

    if (!payment) {
      await this.prisma.auditLog.create({
        data: {
          actorId: null,
          action: 'PAYOS_WEBHOOK_UNMATCHED',
          entityType: 'Payment',
          entityId: intent.providerRef,
          metadata: { provider: intent.provider, raw: intent.raw } as Prisma.InputJsonValue,
        },
      });
      return { received: true, matched: false, providerRef: intent.providerRef };
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: intent.status as PaymentStatus },
    });

    await this.prisma.notification.create({
      data: {
        userId: payment.studentId,
        type: 'PAYMENT_STATUS',
        title: 'Payment status updated',
        message: `Your PayOS payment is now ${intent.status}.`,
        metadata: { paymentId: payment.id, providerRef: intent.providerRef },
      },
    });

    return { received: true, matched: true, payment: updated };
  }
}
