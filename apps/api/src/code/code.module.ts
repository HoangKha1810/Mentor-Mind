import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { CodeController } from './code.controller';
import { CodeJudgeProvider } from './code-judge.interface';
import { CodeService, CODE_JUDGE_PROVIDER } from './code.service';
import { Judge0Provider } from './judge0.provider';
import { MockJudgeProvider } from './mock-judge.provider';

export function selectCodeJudgeProvider(
  config: ConfigService,
  mock: MockJudgeProvider,
  judge0: Judge0Provider,
): CodeJudgeProvider {
  const environment = config.get<string>('NODE_ENV')?.trim().toLowerCase();
  const configuredProvider = config.get<string>('JUDGE_PROVIDER')?.trim().toLowerCase();
  if (!environment || !['development', 'test', 'production'].includes(environment)) {
    throw new Error('NODE_ENV must be explicitly set to development, test, or production.');
  }

  if (environment === 'production' && configuredProvider !== 'judge0') {
    throw new Error('Production requires JUDGE_PROVIDER=judge0; mock judge is not allowed.');
  }

  if (configuredProvider === 'mock') {
    if (!['development', 'test'].includes(environment)) {
      throw new Error('Mock judge is only allowed when NODE_ENV is development or test.');
    }
    return mock;
  }

  if (configuredProvider !== 'judge0') {
    throw new Error('JUDGE_PROVIDER must be explicitly set to judge0 or mock.');
  }

  requireJudge0Url(config);
  return judge0;
}

function requireJudge0Url(config: ConfigService) {
  const value = config.get<string>('JUDGE0_BASE_URL')?.trim();
  if (!value) {
    throw new Error('JUDGE0_BASE_URL is required when JUDGE_PROVIDER=judge0.');
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('JUDGE0_BASE_URL must be a valid HTTP(S) URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('JUDGE0_BASE_URL must be a valid HTTP(S) URL.');
  }
  return value;
}

@Module({
  imports: [AiModule, EntitlementsModule],
  controllers: [CodeController],
  providers: [
    CodeService,
    MockJudgeProvider,
    Judge0Provider,
    {
      provide: CODE_JUDGE_PROVIDER,
      inject: [ConfigService, MockJudgeProvider, Judge0Provider],
      useFactory: (config: ConfigService, mock: MockJudgeProvider, judge0: Judge0Provider) =>
        selectCodeJudgeProvider(config, mock, judge0),
    },
  ],
})
export class CodeModule {}
