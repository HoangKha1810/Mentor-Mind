import { Injectable } from '@nestjs/common';
import { EmailInput, EmailProvider } from './email-provider.interface';

@Injectable()
export class MockEmailProvider implements EmailProvider {
  readonly name = 'mock';

  async send(input: EmailInput): Promise<{ id: string; provider: string }> {
    console.info(`[mock-email] ${input.from ?? 'default'} -> ${input.to}: ${input.subject}`);
    return { id: `mock_email_${Date.now()}`, provider: this.name };
  }
}
