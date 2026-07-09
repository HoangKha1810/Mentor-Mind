export type PaymentIntent = {
  provider: string;
  providerRef: string;
  checkoutUrl?: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  raw?: unknown;
};

export interface PaymentProvider {
  readonly name: string;
  createIntent(input: {
    amount: number;
    currency: string;
    description: string;
    returnUrl: string;
    cancelUrl: string;
    metadata: Record<string, string>;
  }): Promise<PaymentIntent>;
  verifyWebhook(payload: unknown, signature?: string): Promise<PaymentIntent>;
}
