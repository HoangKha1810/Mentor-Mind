import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CodeLanguage, CodeVerdict } from '@prisma/client';
import { codingLanguageOptions } from '@mentormind/shared';
import { CodeJudgeProvider, JudgeRequest, JudgeResult } from './code-judge.interface';

const verdictMap: Record<number, CodeVerdict> = {
  3: CodeVerdict.ACCEPTED,
  4: CodeVerdict.WRONG_ANSWER,
  5: CodeVerdict.TIME_LIMIT_EXCEEDED,
  6: CodeVerdict.COMPILATION_ERROR,
  7: CodeVerdict.RUNTIME_ERROR,
  8: CodeVerdict.RUNTIME_ERROR,
  9: CodeVerdict.RUNTIME_ERROR,
  10: CodeVerdict.RUNTIME_ERROR,
  11: CodeVerdict.RUNTIME_ERROR,
  12: CodeVerdict.RUNTIME_ERROR,
  13: CodeVerdict.INTERNAL_ERROR,
};

@Injectable()
export class Judge0Provider implements CodeJudgeProvider {
  readonly name = 'judge0';
  private readonly baseUrl?: string;
  private readonly apiKey?: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('JUDGE0_BASE_URL') || undefined;
    this.apiKey = config.get<string>('JUDGE0_API_KEY') || undefined;
  }

  async run(input: JudgeRequest): Promise<JudgeResult> {
    if (!this.baseUrl) {
      return {
        verdict: CodeVerdict.INTERNAL_ERROR,
        runtimeMs: 0,
        memoryKb: 0,
        passedTests: 0,
        totalTests: input.testCases.length,
        errorMessage: 'JUDGE0_BASE_URL is not configured',
      };
    }

    const languageId = codingLanguageOptions.find((item) => item.value === input.language)?.judge0Id;
    const results = await Promise.all(
      input.testCases.map(async (test) => {
        const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=true&wait=true`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.authHeaders(),
          },
          body: JSON.stringify({
            language_id: languageId,
            source_code: Buffer.from(input.code).toString('base64'),
            stdin: Buffer.from(test.input).toString('base64'),
            expected_output: Buffer.from(test.expectedOutput).toString('base64'),
            cpu_time_limit: Math.ceil(input.timeLimitMs / 1000),
            memory_limit: input.memoryLimitMb * 1024,
          }),
        });
        if (!response.ok) {
          throw new Error(`Judge0 failed: ${response.status}`);
        }
        const json = (await response.json()) as {
          stdout?: string;
          stderr?: string;
          compile_output?: string;
          time?: string;
          memory?: number;
          status?: { id?: number; description?: string };
        };
        const verdict = verdictMap[json.status?.id ?? 13] ?? CodeVerdict.INTERNAL_ERROR;
        const output = json.stdout ? Buffer.from(json.stdout, 'base64').toString('utf8') : '';
        return { test, json, verdict, output };
      }),
    );

    const firstFailed = results.find((result) => result.verdict !== CodeVerdict.ACCEPTED);
    const runtimeMs = Math.max(
      ...results.map((result) => Math.round(Number(result.json.time ?? 0) * 1000)),
      0,
    );
    const memoryKb = Math.max(...results.map((result) => result.json.memory ?? 0), 0);
    const passedTests = results.filter((result) => result.verdict === CodeVerdict.ACCEPTED).length;
    return {
      verdict: firstFailed?.verdict ?? CodeVerdict.ACCEPTED,
      runtimeMs,
      memoryKb,
      passedTests,
      totalTests: input.testCases.length,
      errorMessage: firstFailed?.json.stderr ?? firstFailed?.json.compile_output,
      publicResults: results
        .filter((result) => !result.test.isHidden)
        .map((result) => ({
          input: result.test.input,
          expectedOutput: result.test.expectedOutput,
          actualOutput: result.output,
          passed: result.verdict === CodeVerdict.ACCEPTED,
        })),
    };
  }

  private authHeaders() {
    if (!this.apiKey) {
      return {};
    }

    const header = process.env.JUDGE0_AUTH_HEADER || 'X-RapidAPI-Key';
    const rapidApiHost = process.env.JUDGE0_RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    return {
      [header]: this.apiKey,
      ...(header === 'X-RapidAPI-Key' ? { 'X-RapidAPI-Host': rapidApiHost } : {}),
    };
  }
}
