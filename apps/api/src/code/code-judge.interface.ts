import { CodeLanguage, CodeVerdict } from '@prisma/client';

export type JudgeTestCase = {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
};

export type JudgeRequest = {
  language: CodeLanguage;
  code: string;
  testCases: JudgeTestCase[];
  timeLimitMs: number;
  memoryLimitMb: number;
};

export type JudgeResult = {
  verdict: CodeVerdict;
  runtimeMs: number;
  memoryKb: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  publicResults?: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }>;
};

export interface CodeJudgeProvider {
  readonly name: string;
  run(input: JudgeRequest): Promise<JudgeResult>;
}
