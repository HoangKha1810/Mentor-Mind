export type EmailInput = {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(input: EmailInput): Promise<{ id: string; provider: string }>;
}
