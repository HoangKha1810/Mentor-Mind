import { Injectable } from '@nestjs/common';
import { CodeVerdict } from '@prisma/client';
import { CodeJudgeProvider, JudgeRequest, JudgeResult } from './code-judge.interface';

@Injectable()
export class MockJudgeProvider implements CodeJudgeProvider {
  readonly name = 'mock';

  async run(input: JudgeRequest): Promise<JudgeResult> {
    const totalTests = input.testCases.length;
    const syntacticallySuspicious = input.code.trim().length < 12 || /\bthrow\s+new\b|\bTODO\b/i.test(input.code);
    const forcedWrong = /wrong_answer|return\s+null|console\.log\(['"]wrong/i.test(input.code);
    const verdict = syntacticallySuspicious
      ? CodeVerdict.RUNTIME_ERROR
      : forcedWrong
        ? CodeVerdict.WRONG_ANSWER
        : CodeVerdict.ACCEPTED;
    const passedTests = verdict === CodeVerdict.ACCEPTED ? totalTests : Math.max(totalTests - 1, 0);

    return {
      verdict,
      runtimeMs: 24 + Math.min(input.code.length, 200),
      memoryKb: 12_288,
      passedTests,
      totalTests,
      errorMessage:
        verdict === CodeVerdict.ACCEPTED
          ? undefined
          : verdict === CodeVerdict.RUNTIME_ERROR
            ? 'Mock judge detected incomplete or intentionally failing code.'
            : 'Mock judge simulated a wrong answer on at least one test.',
      publicResults: input.testCases
        .filter((test) => !test.isHidden)
        .map((test, index) => ({
          input: test.input,
          expectedOutput: test.expectedOutput,
          actualOutput: verdict === CodeVerdict.ACCEPTED ? test.expectedOutput : index === 0 ? 'mock-mismatch' : test.expectedOutput,
          passed: verdict === CodeVerdict.ACCEPTED || index > 0,
        })),
    };
  }
}
