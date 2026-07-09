import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { CodeController } from './code.controller';
import { CodeService, CODE_JUDGE_PROVIDER } from './code.service';
import { Judge0Provider } from './judge0.provider';
import { MockJudgeProvider } from './mock-judge.provider';

@Module({
  imports: [AiModule],
  controllers: [CodeController],
  providers: [
    CodeService,
    MockJudgeProvider,
    Judge0Provider,
    {
      provide: CODE_JUDGE_PROVIDER,
      inject: [ConfigService, MockJudgeProvider, Judge0Provider],
      useFactory: (config: ConfigService, mock: MockJudgeProvider, judge0: Judge0Provider) =>
        config.get<string>('JUDGE_PROVIDER') === 'judge0' ? judge0 : mock,
    },
  ],
})
export class CodeModule {}
