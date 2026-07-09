import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { PaymentIntent, PaymentProvider } from './payment-provider.interface';

type PayOsCreatePaymentResponse = {
  code?: string;
  desc?: string;
  data?: {
    checkoutUrl?: string;
    paymentLinkId?: string;
    orderCode?: number | string;
    status?: string;
  };
};

type PayOsWebhookPayload = {
  code?: string;
  desc?: string;
  success?: boolean;
  data?: Record<string, unknown>;
  signature?: string;
};

@Injectable()
export class PayOsPaymentProvider implements PaymentProvider {
  readonly name = 'payos';
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = config.get<string>('PAYOS_BASE_URL') || 'https://api-merchant.payos.vn';
  }

  async createIntent(input: {
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<PaymentIntent> {
    this.assertConfigured();

    const orderCode = Number(input.metadata.orderCode ?? Date.now());
    const payload = {
      orderCode,
      amount: Math.round(input.amount),
      description: input.description.slice(0, 25),
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      buyerName: input.metadata.fullName,
      buyerEmail: input.metadata.email,
      signature: '',
    };

    payload.signature = this.signData({
      amount: payload.amount,
      cancelUrl: payload.cancelUrl,
      description: payload.description,
      orderCode: payload.orderCode,
      returnUrl: payload.returnUrl,
    });

    const response = await fetch(`${this.baseUrl}/v2/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': this.clientId,
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as PayOsCreatePaymentResponse;
    if (!response.ok || json.code !== '00' || !json.data?.checkoutUrl) {
      throw new BadRequestException(json.desc || 'PayOS payment link creation failed');
    }

    return {
      provider: this.name,
      providerRef: String(json.data.paymentLinkId ?? json.data.orderCode ?? orderCode),
      checkoutUrl: json.data.checkoutUrl,
      status: this.mapPayOsStatus(json.data.status),
      raw: json,
    };
  }

  async verifyWebhook(payload: unknown, signature?: string): Promise<PaymentIntent> {
    this.assertConfigured();

    const body = payload as PayOsWebhookPayload;
    const webhookSignature = signature ?? body.signature;
    if (!body.data || !webhookSignature) {
      throw new BadRequestException('Invalid PayOS webhook payload');
    }

    const expectedSignature = this.signData(body.data);
    if (webhookSignature !== expectedSignature) {
      throw new BadRequestException('Invalid PayOS webhook signature');
    }

    const providerRef =
      body.data.paymentLinkId ?? body.data.orderCode ?? body.data.reference ?? `payos_${Date.now()}`;
    const payOsCode = String(body.data.code ?? body.code ?? '');

    return {
      provider: this.name,
      providerRef: String(providerRef),
      status: body.success === false || payOsCode !== '00' ? 'FAILED' : 'PAID',
      raw: payload,
    };
  }

  private get clientId() {
    return this.config.get<string>('PAYOS_CLIENT_ID') ?? '';
  }

  private get apiKey() {
    return this.config.get<string>('PAYOS_API_KEY') ?? '';
  }

  private get checksumKey() {
    return this.config.get<string>('PAYOS_CHECKSUM_KEY') ?? '';
  }

  private assertConfigured() {
    if (!this.clientId || !this.apiKey || !this.checksumKey) {
      throw new BadRequestException(
        'PayOS is not configured. Set PAYOS_CLIENT_ID, PAYOS_API_KEY and PAYOS_CHECKSUM_KEY.',
      );
    }
  }

  private signData(data: Record<string, unknown>) {
    const raw = Object.keys(data)
      .sort()
      .map((key) => `${key}=${this.formatValue(data[key])}`)
      .join('&');

    return createHmac('sha256', this.checksumKey).update(raw).digest('hex');
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private mapPayOsStatus(status?: string): PaymentIntent['status'] {
    if (status === 'PAID') return 'PAID';
    if (status === 'CANCELLED') return 'CANCELLED';
    return 'PENDING';
  }
}
