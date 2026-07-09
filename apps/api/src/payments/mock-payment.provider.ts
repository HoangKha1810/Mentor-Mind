import { Injectable } from '@nestjs/common';
import { PaymentIntent, PaymentProvider } from './payment-provider.interface';

@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createIntent(input: {
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<PaymentIntent> {
    return {
      provider: this.name,
      providerRef: `mock_${Date.now()}_${input.amount}_${input.currency}`,
      checkoutUrl: '/dashboard/payments/mock-checkout',
      status: 'PENDING',
    };
  }

  async verifyWebhook(): Promise<PaymentIntent> {
    return { provider: this.name, providerRef: `mock_webhook_${Date.now()}`, status: 'PAID' };
  }
}
