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
  statusDescription?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  publicResults?: JudgePublicResult[];
};

export type JudgePublicResult = {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  verdict: CodeVerdict;
  statusDescription?: string;
  runtimeMs: number;
  memoryKb: number;
  errorMessage?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
};

export interface CodeJudgeProvider {
  readonly name: string;
  run(input: JudgeRequest): Promise<JudgeResult>;
}
