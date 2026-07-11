import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CodeLanguage, CodeVerdict } from '@prisma/client';
import { codingLanguageOptions } from '@mentormind/shared';
import {
  CodeJudgeProvider,
  JudgePublicResult,
  JudgeRequest,
  JudgeResult,
  JudgeTestCase,
} from './code-judge.interface';

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
  14: CodeVerdict.RUNTIME_ERROR,
};

const pendingStatusIds = new Set([1, 2]);
const maxDiagnosticLength = 16_000;

type Judge0Submission = {
  token?: string;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  time?: string | number | null;
  memory?: string | number | null;
  status?: { id?: number; description?: string } | null;
};

type Judge0EncodingMode = 'base64' | 'plain';

type TestExecution = {
  test: JudgeTestCase;
  verdict: CodeVerdict;
  statusDescription?: string;
  runtimeMs: number;
  memoryKb: number;
  stdout: string;
  stderr?: string;
  compileOutput?: string;
  errorMessage?: string;
};

@Injectable()
export class Judge0Provider implements CodeJudgeProvider {
  readonly name = 'judge0';
  private readonly baseUrl?: string;
  private readonly apiKey?: string;
  private readonly authHeader: string;
  private readonly rapidApiHost: string;
  private readonly requestTimeoutMs: number;
  private readonly pollIntervalMs: number;
  private readonly maxPollAttempts: number;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('JUDGE0_BASE_URL')?.replace(/\/+$/, '') || undefined;
    this.apiKey = config.get<string>('JUDGE0_API_KEY') || undefined;
    this.authHeader = config.get<string>('JUDGE0_AUTH_HEADER') || 'X-RapidAPI-Key';
    this.rapidApiHost = config.get<string>('JUDGE0_RAPIDAPI_HOST') || 'judge0-ce.p.rapidapi.com';
    this.requestTimeoutMs = configuredNumber(
      config,
      'JUDGE0_REQUEST_TIMEOUT_MS',
      15_000,
      1_000,
      60_000,
    );
    this.pollIntervalMs = configuredNumber(config, 'JUDGE0_POLL_INTERVAL_MS', 250, 0, 5_000);
    this.maxPollAttempts = configuredNumber(config, 'JUDGE0_MAX_POLL_ATTEMPTS', 40, 1, 200);
  }

  async run(input: JudgeRequest): Promise<JudgeResult> {
    if (!this.baseUrl) {
      return this.configurationError(input, 'JUDGE0_BASE_URL chưa được cấu hình.');
    }

    const languageId = codingLanguageOptions.find(
      (item) => item.value === input.language,
    )?.judge0Id;
    if (!languageId) {
      return this.configurationError(
        input,
        `Ngôn ngữ ${input.language} chưa được ánh xạ trên Judge0.`,
      );
    }

    const results = await Promise.all(
      input.testCases.map((test) => this.executeTest(input, test, languageId)),
    );
    const firstFailed = results.find((result) => result.verdict !== CodeVerdict.ACCEPTED);
    const representative = firstFailed ?? results[0];
    const publicRepresentative =
      results.find((result) => !result.test.isHidden && result.verdict !== CodeVerdict.ACCEPTED) ??
      results.find((result) => !result.test.isHidden);

    return {
      verdict: firstFailed?.verdict ?? CodeVerdict.ACCEPTED,
      runtimeMs: Math.max(0, ...results.map((result) => result.runtimeMs)),
      memoryKb: Math.max(0, ...results.map((result) => result.memoryKb)),
      passedTests: results.filter((result) => result.verdict === CodeVerdict.ACCEPTED).length,
      totalTests: input.testCases.length,
      errorMessage: firstFailed?.errorMessage,
      statusDescription: representative?.statusDescription,
      stdout: publicRepresentative?.stdout,
      stderr: firstFailed?.stderr,
      compileOutput: firstFailed?.compileOutput,
      publicResults: results
        .filter((result) => !result.test.isHidden)
        .map((result) => this.toPublicResult(result)),
    };
  }

  private async executeTest(
    input: JudgeRequest,
    test: JudgeTestCase,
    languageId: number,
  ): Promise<TestExecution> {
    let lastMessage = '';
    for (const encoding of judge0EncodingOrder()) {
      try {
        const execution = await this.submitAndNormalize(input, test, languageId, encoding);
        if (shouldRetryWithAlternateEncoding(execution)) {
          lastMessage = execution.errorMessage ?? execution.statusDescription ?? '';
          continue;
        }
        return execution;
      } catch (error) {
        const message = sanitizeText(error instanceof Error ? error.message : String(error));
        lastMessage = message;
        if (shouldRetryMessageWithAlternateEncoding(message)) {
          continue;
        }
        break;
      }
    }

    return {
      test,
      verdict: CodeVerdict.INTERNAL_ERROR,
      statusDescription: 'Judge0 Internal Error',
      runtimeMs: 0,
      memoryKb: 0,
      stdout: '',
      errorMessage: lastMessage || 'Judge0 không thể chạy test case này.',
    };
  }

  private async submitAndNormalize(
    input: JudgeRequest,
    test: JudgeTestCase,
    languageId: number,
    encoding: Judge0EncodingMode,
  ) {
    const initial = await this.requestJson(
      `${this.baseUrl}/submissions${submissionQuery(encoding)}`,
      {
        method: 'POST',
        body: JSON.stringify({
          language_id: languageId,
          source_code: encodeJudgeField(input.code, encoding),
          stdin: encodeJudgeField(test.input, encoding),
          expected_output: encodeJudgeField(test.expectedOutput, encoding),
          cpu_time_limit: Math.max(0.1, Math.round(input.timeLimitMs) / 1000),
          wall_time_limit: Math.max(1, Math.ceil(input.timeLimitMs / 1000) + 1),
          memory_limit: input.memoryLimitMb * 1024,
        }),
      },
    );
    const submission = await this.waitForResult(initial, encoding);
    return this.normalizeExecution(test, submission, encoding);
  }

  private async waitForResult(
    initial: Judge0Submission,
    encoding: Judge0EncodingMode,
  ): Promise<Judge0Submission> {
    if (isTerminal(initial)) {
      return initial;
    }
    if (!initial.token) {
      throw new Error('Judge0 không trả về trạng thái hoặc submission token.');
    }

    for (let attempt = 0; attempt < this.maxPollAttempts; attempt += 1) {
      if (this.pollIntervalMs > 0) {
        await delay(this.pollIntervalMs);
      }
      const result = await this.requestJson(
        `${this.baseUrl}/submissions/${encodeURIComponent(initial.token)}` +
          resultQuery(encoding),
        { method: 'GET' },
      );
      if (isTerminal(result)) {
        return result;
      }
    }

    throw new Error('Judge0 quá thời gian chờ xử lý submission. Vui lòng chạy lại.');
  }

  private normalizeExecution(
    test: JudgeTestCase,
    submission: Judge0Submission,
    encoding: Judge0EncodingMode,
  ): TestExecution {
    const statusId = submission.status?.id ?? 13;
    const verdict = verdictMap[statusId] ?? CodeVerdict.INTERNAL_ERROR;
    const statusDescription = optionalSanitized(submission.status?.description);
    const responseEncoded = encoding === 'base64';
    const stdout = decodeJudge0Text(submission.stdout, responseEncoded) ?? '';
    const stderr = decodeJudge0Text(submission.stderr, responseEncoded);
    const compileOutput = decodeJudge0Text(submission.compile_output, responseEncoded);
    const message = decodeJudge0Text(submission.message, responseEncoded);

    return {
      test,
      verdict,
      statusDescription,
      runtimeMs: parseRuntimeMs(submission.time),
      memoryKb: parseNonNegativeNumber(submission.memory),
      stdout,
      stderr,
      compileOutput,
      errorMessage:
        verdict === CodeVerdict.ACCEPTED
          ? undefined
          : diagnosticMessage(verdict, { statusDescription, stderr, compileOutput, message }),
    };
  }

  private async requestJson(url: string, init: RequestInit): Promise<Judge0Submission> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeaders(),
          ...init.headers,
        },
        signal: controller.signal,
      });
      const rawBody = await response.text();
      if (!response.ok) {
        const detail = sanitizeHttpBody(rawBody);
        throw new Error(`Judge0 HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
      }
      if (!rawBody) {
        throw new Error('Judge0 trả về phản hồi rỗng.');
      }
      try {
        return JSON.parse(rawBody) as Judge0Submission;
      } catch {
        throw new Error('Judge0 trả về dữ liệu không hợp lệ.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Judge0 không phản hồi sau ${this.requestTimeoutMs}ms.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private toPublicResult(result: TestExecution): JudgePublicResult {
    return {
      input: result.test.input,
      expectedOutput: result.test.expectedOutput,
      actualOutput: result.stdout,
      passed: result.verdict === CodeVerdict.ACCEPTED,
      verdict: result.verdict,
      statusDescription: result.statusDescription,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
      errorMessage: result.errorMessage,
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
    };
  }

  private configurationError(input: JudgeRequest, errorMessage: string): JudgeResult {
    return {
      verdict: CodeVerdict.INTERNAL_ERROR,
      runtimeMs: 0,
      memoryKb: 0,
      passedTests: 0,
      totalTests: input.testCases.length,
      errorMessage,
      statusDescription: 'Judge0 Configuration Error',
      publicResults: input.testCases
        .filter((test) => !test.isHidden)
        .map((test) => ({
          input: test.input,
          expectedOutput: test.expectedOutput,
          actualOutput: '',
          passed: false,
          verdict: CodeVerdict.INTERNAL_ERROR,
          statusDescription: 'Judge0 Configuration Error',
          runtimeMs: 0,
          memoryKb: 0,
          errorMessage,
          stdout: '',
        })),
    };
  }

  private authHeaders(): Record<string, string> {
    if (!this.apiKey) {
      return {};
    }
    return {
      [this.authHeader]: this.apiKey,
      ...(this.authHeader === 'X-RapidAPI-Key' ? { 'X-RapidAPI-Host': this.rapidApiHost } : {}),
    };
  }
}

function configuredNumber(
  config: ConfigService,
  key: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const parsed = Number(config.get<string | number>(key) ?? fallback);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(parsed), minimum), maximum);
}

function isTerminal(submission: Judge0Submission) {
  const statusId = submission.status?.id;
  return typeof statusId === 'number' && !pendingStatusIds.has(statusId);
}

function judge0EncodingOrder(): Judge0EncodingMode[] {
  return ['plain', 'base64'];
}

function submissionQuery(encoding: Judge0EncodingMode) {
  return encoding === 'base64' ? '?base64_encoded=true&wait=true' : '?wait=true';
}

function resultQuery(encoding: Judge0EncodingMode) {
  const fields = 'fields=token,stdout,stderr,compile_output,message,time,memory,status';
  return encoding === 'base64' ? `?base64_encoded=true&${fields}` : `?${fields}`;
}

function encodeJudgeField(value: string, encoding: Judge0EncodingMode) {
  return encoding === 'base64' ? encodeBase64(value) : value;
}

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function decodeJudge0Text(value: string | null | undefined, encoded: boolean) {
  if (value == null || value === '') {
    return undefined;
  }
  if (!encoded) {
    return optionalSanitized(value);
  }

  const compact = value.replace(/\s/g, '');
  if (compact.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    return optionalSanitized(value);
  }

  try {
    const bytes = Buffer.from(compact, 'base64');
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const roundTrip = Buffer.from(decoded, 'utf8').toString('base64').replace(/=+$/, '');
    if (roundTrip !== compact.replace(/=+$/, '')) {
      return optionalSanitized(value);
    }
    return optionalSanitized(decoded);
  } catch {
    return optionalSanitized(value);
  }
}

function shouldRetryWithAlternateEncoding(result: TestExecution) {
  if (result.verdict !== CodeVerdict.INTERNAL_ERROR) {
    return false;
  }
  const detail = [
    result.errorMessage,
    result.stderr,
    result.compileOutput,
    result.statusDescription,
  ]
    .filter(Boolean)
    .join('\n');
  return shouldRetryMessageWithAlternateEncoding(detail);
}

function shouldRetryMessageWithAlternateEncoding(detail: string) {
  return /rb_sysopen|No such file or directory.*\/box\/script|\/box\/script\.[a-z0-9]+/i.test(
    detail,
  );
}

function optionalSanitized(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }
  const sanitized = sanitizeText(value);
  return sanitized || undefined;
}

function sanitizeText(value: string) {
  const clean = value
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u0080-\uFFFF]/g, '')
    .replace(/\r\n/g, '\n');
  if (clean.length <= maxDiagnosticLength) {
    return clean;
  }
  return `${clean.slice(0, maxDiagnosticLength)}\n[đã rút gọn]`;
}

function sanitizeHttpBody(rawBody: string) {
  if (!rawBody) {
    return '';
  }
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    const detail = parsed.error ?? parsed.message ?? parsed.detail;
    return sanitizeText(typeof detail === 'string' ? detail : JSON.stringify(parsed));
  } catch {
    return sanitizeText(rawBody);
  }
}

function parseRuntimeMs(value: Judge0Submission['time']) {
  return Math.max(0, Math.round(Number(value ?? 0) * 1000) || 0);
}

function parseNonNegativeNumber(value: Judge0Submission['memory']) {
  return Math.max(0, Math.round(Number(value ?? 0)) || 0);
}

function diagnosticMessage(
  verdict: CodeVerdict,
  fields: {
    statusDescription?: string;
    stderr?: string;
    compileOutput?: string;
    message?: string;
  },
) {
  const detail =
    verdict === CodeVerdict.COMPILATION_ERROR
      ? (fields.compileOutput ?? fields.stderr ?? fields.message)
      : (fields.stderr ?? fields.compileOutput ?? fields.message);
  if (detail) {
    return detail;
  }

  const fallbacks: Record<CodeVerdict, string | undefined> = {
    [CodeVerdict.ACCEPTED]: undefined,
    [CodeVerdict.WRONG_ANSWER]: 'Output thực tế không khớp output mong đợi.',
    [CodeVerdict.TIME_LIMIT_EXCEEDED]: 'Chương trình chạy quá giới hạn thời gian.',
    [CodeVerdict.RUNTIME_ERROR]: 'Chương trình gặp lỗi khi chạy.',
    [CodeVerdict.COMPILATION_ERROR]: 'Mã nguồn không biên dịch được.',
    [CodeVerdict.INTERNAL_ERROR]: 'Judge0 gặp lỗi nội bộ khi chạy chương trình.',
  };
  return fields.statusDescription ?? fallbacks[verdict];
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}
