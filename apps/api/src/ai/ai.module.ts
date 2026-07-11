import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { AIProvider } from './ai-provider.interface';
import { AI_PROVIDER, AiService } from './ai.service';
import { AIUsageService } from './ai-usage.service';
import { AiController } from './ai.controller';
import { MockAIProvider } from './mock-ai.provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';
import { PromptTemplateService } from './prompt-template.service';

export function selectAiProvider(
  config: ConfigService,
  mock: MockAIProvider,
  openai: OpenAICompatibleProvider,
): AIProvider {
  const environment = config.get<string>('NODE_ENV')?.trim().toLowerCase();
  const configuredProvider = config.get<string>('AI_PROVIDER')?.trim().toLowerCase();
  if (!environment || !['development', 'test', 'production'].includes(environment)) {
    throw new Error('NODE_ENV must be explicitly set to development, test, or production.');
  }

  if (environment === 'production' && configuredProvider !== 'openai') {
    throw new Error('Production requires AI_PROVIDER=openai; mock AI is not allowed.');
  }

  if (configuredProvider === 'mock') {
    if (!['development', 'test'].includes(environment)) {
      throw new Error('Mock AI is only allowed when NODE_ENV is development or test.');
    }
    return mock;
  }

  if (configuredProvider !== 'openai') {
    throw new Error('AI_PROVIDER must be explicitly set to openai or mock.');
  }

  requireConfig(config, 'AI_API_KEY');
  if (environment === 'production') {
    requireHttpUrl(config, 'AI_BASE_URL');
    requireConfig(config, 'AI_MODEL');
  }
  return openai;
}

function requireConfig(config: ConfigService, key: string) {
  const value = config.get<string>(key)?.trim();
  if (!value) {
    throw new Error(`${key} is required when AI_PROVIDER=openai.`);
  }
  return value;
}

function requireHttpUrl(config: ConfigService, key: string) {
  const value = requireConfig(config, key);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${key} must be a valid HTTP(S) URL.`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${key} must be a valid HTTP(S) URL.`);
  }
  return value;
}

@Module({
  imports: [EntitlementsModule],
  controllers: [AiController],
  providers: [
    AiService,
    PromptTemplateService,
    AIUsageService,
    MockAIProvider,
    OpenAICompatibleProvider,
    {
      provide: AI_PROVIDER,
      inject: [ConfigService, MockAIProvider, OpenAICompatibleProvider],
      useFactory: (config: ConfigService, mock: MockAIProvider, openai: OpenAICompatibleProvider) =>
        selectAiProvider(config, mock, openai),
    },
  ],
  exports: [AiService, PromptTemplateService, AIUsageService],
})
export class AiModule {}
