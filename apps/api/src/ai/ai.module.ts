import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { AI_PROVIDER, AiService } from './ai.service';
import { AIUsageService } from './ai-usage.service';
import { AiController } from './ai.controller';
import { MockAIProvider } from './mock-ai.provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';
import { PromptTemplateService } from './prompt-template.service';

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
      useFactory: (
        config: ConfigService,
        mock: MockAIProvider,
        openai: OpenAICompatibleProvider,
      ) => (config.get<string>('AI_PROVIDER') === 'openai' ? openai : mock),
    },
  ],
  exports: [AiService, PromptTemplateService, AIUsageService],
})
export class AiModule {}
