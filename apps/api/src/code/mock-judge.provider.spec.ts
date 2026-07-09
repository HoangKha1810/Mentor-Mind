import { CodeLanguage, CodeVerdict } from '@prisma/client';
import { MockJudgeProvider } from './mock-judge.provider';

describe('MockJudgeProvider', () => {
  const provider = new MockJudgeProvider();

  it('accepts sufficiently complete code without executing it', async () => {
    const result = await provider.run({
      language: CodeLanguage.JAVASCRIPT,
      code: 'function solve(input) { return input; }',
      testCases: [{ input: 'a', expectedOutput: 'a', isHidden: false }],
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    });

    expect(result.verdict).toBe(CodeVerdict.ACCEPTED);
    expect(result.passedTests).toBe(1);
  });

  it('simulates wrong answers deterministically', async () => {
    const result = await provider.run({
      language: CodeLanguage.JAVASCRIPT,
      code: 'function solve() { return null; }',
      testCases: [{ input: 'a', expectedOutput: 'a', isHidden: false }],
      timeLimitMs: 1000,
      memoryLimitMb: 128,
    });

    expect(result.verdict).toBe(CodeVerdict.WRONG_ANSWER);
  });
});
