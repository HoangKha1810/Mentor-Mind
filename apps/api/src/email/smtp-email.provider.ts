import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
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

    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const from = input.from ?? this.config.get<string>('SMTP_FROM') ?? user ?? 'no-reply@mentormind.center';
    const secure = this.config.get<string>('SMTP_SECURE') === 'true' || port === 465;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    const result = await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    return { id: String(result.messageId ?? `smtp_${Date.now()}`), provider: this.name };
  }
}
