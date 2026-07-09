import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PaymentStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
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

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  async createPaymentLink(studentId: string, input: unknown) {
    const body = createPaymentSchema.parse(input);
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
