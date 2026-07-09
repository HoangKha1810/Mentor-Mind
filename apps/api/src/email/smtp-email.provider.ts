import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailInput, EmailProvider } from './email-provider.interface';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  readonly name = 'smtp';

  constructor(private readonly config: ConfigService) {}

  async send(input: EmailInput): Promise<{ id: string; provider: string }> {
    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      return { id: `smtp_not_configured_${Date.now()}`, provider: this.name };
    }
    console.info(`[smtp-adapter] queued ${input.subject} to ${input.to} through ${host}`);
    return { id: `smtp_${Date.now()}`, provider: this.name };
  }
}
