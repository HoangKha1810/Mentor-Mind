import { Injectable, Logger } from '@nestjs/common';
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
const sandboxUnavailableMessage =
  'Máy chấm không thể khởi tạo môi trường chạy code. Vui lòng thử lại sau.';

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
  private readonly logger = new Logger(Judge0Provider.name);
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
    const publicFailure = results.find(
      (result) => !result.test.isHidden && result.verdict !== CodeVerdict.ACCEPTED,
    );
    const visibleFirstFailure = firstFailed?.test.isHidden ? undefined : firstFailed;
    const representative = firstFailed ?? results[0];
    const publicRepresentative = publicFailure ?? results.find((result) => !result.test.isHidden);

    return {
      verdict: firstFailed?.verdict ?? CodeVerdict.ACCEPTED,
      runtimeMs: Math.max(0, ...results.map((result) => result.runtimeMs)),
      memoryKb: Math.max(0, ...results.map((result) => result.memoryKb)),
      passedTests: results.filter((result) => result.verdict === CodeVerdict.ACCEPTED).length,
      totalTests: input.testCases.length,
      errorMessage:
        visibleFirstFailure?.errorMessage ??
        (firstFailed?.test.isHidden ? hiddenTestErrorMessage(firstFailed.verdict) : undefined),
      statusDescription: representative?.statusDescription,
      stdout: publicRepresentative?.stdout,
      stderr: visibleFirstFailure?.stderr,
      compileOutput: visibleFirstFailure?.compileOutput,
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
    try {
      return await this.submitAndNormalize(input, test, languageId);
    } catch (error) {
      const message = sanitizeText(error instanceof Error ? error.message : String(error));
      const sandboxFailure = isSandboxInitializationFailure(message);
      if (sandboxFailure) {
        this.logger.error(`Judge0 sandbox initialization failed: ${message}`);
      }
      return {
        test,
        verdict: CodeVerdict.INTERNAL_ERROR,
        statusDescription: sandboxFailure ? 'Judge0 Sandbox Unavailable' : 'Judge0 Internal Error',
        runtimeMs: 0,
        memoryKb: 0,
        stdout: '',
        errorMessage: sandboxFailure
          ? sandboxUnavailableMessage
          : message || 'Judge0 không thể chạy test case này.',
      };
    }
  }

  private async submitAndNormalize(input: JudgeRequest, test: JudgeTestCase, languageId: number) {
    const initial = await this.requestJson(
      `${this.baseUrl}/submissions?base64_encoded=true&wait=true`,
      {
        method: 'POST',
        body: JSON.stringify({
          language_id: languageId,
          source_code: encodeBase64(input.code),
          stdin: encodeBase64(test.input),
          expected_output: encodeBase64(test.expectedOutput),
          cpu_time_limit: Math.max(0.1, Math.round(input.timeLimitMs) / 1000),
          wall_time_limit: Math.max(1, Math.ceil(input.timeLimitMs / 1000) + 1),
          memory_limit: input.memoryLimitMb * 1024,
        }),
      },
    );
    const submission = await this.waitForResult(initial);
    return this.normalizeExecution(test, submission);
  }

  private async waitForResult(initial: Judge0Submission): Promise<Judge0Submission> {
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
          '?base64_encoded=true&fields=token,stdout,stderr,compile_output,message,time,memory,status',
        { method: 'GET' },
      );
      if (isTerminal(result)) {
        return result;
      }
    }

    throw new Error('Judge0 quá thời gian chờ xử lý submission. Vui lòng chạy lại.');
  }

  private normalizeExecution(test: JudgeTestCase, submission: Judge0Submission): TestExecution {
    const statusId = submission.status?.id ?? 13;
    const verdict = verdictMap[statusId] ?? CodeVerdict.INTERNAL_ERROR;
    const statusDescription = optionalSanitized(submission.status?.description);
    const stdout = decodeJudge0Text(submission.stdout) ?? '';
    const stderr = decodeJudge0Text(submission.stderr);
    const compileOutput = decodeJudge0Text(submission.compile_output);
    const message = decodeJudge0Text(submission.message);
    const diagnostic =
      verdict === CodeVerdict.ACCEPTED
        ? undefined
        : diagnosticMessage(verdict, { statusDescription, stderr, compileOutput, message });
    const sandboxFailure =
      verdict === CodeVerdict.INTERNAL_ERROR && isSandboxInitializationFailure(diagnostic ?? '');

    if (sandboxFailure) {
      this.logger.error(`Judge0 sandbox initialization failed: ${diagnostic}`);
    }

    return {
      test,
      verdict,
      statusDescription: sandboxFailure ? 'Judge0 Sandbox Unavailable' : statusDescription,
      runtimeMs: parseRuntimeMs(submission.time),
      memoryKb: parseNonNegativeNumber(submission.memory),
      stdout,
      stderr,
      compileOutput,
      errorMessage: sandboxFailure ? sandboxUnavailableMessage : diagnostic,
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

function encodeBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function decodeJudge0Text(value: string | null | undefined) {
  if (value == null || value === '') {
    return undefined;
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

function isSandboxInitializationFailure(detail: string) {
  return (
    /rb_sysopen[^\n]*\/box\//i.test(detail) ||
    /No such file or directory[^\n]*\/box\//i.test(detail) ||
    /chown:[^\n]*cannot access[^\n]*\/box/i.test(detail) ||
    /Failed to create control group/i.test(detail) ||
    /Cannot write \/sys\/fs\/cgroup/i.test(detail) ||
    /Sandbox ID out of range/i.test(detail)
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

function hiddenTestErrorMessage(verdict: CodeVerdict) {
  const messages: Record<CodeVerdict, string | undefined> = {
    [CodeVerdict.ACCEPTED]: undefined,
    [CodeVerdict.WRONG_ANSWER]: 'Một hoặc nhiều test ẩn chưa đạt.',
    [CodeVerdict.TIME_LIMIT_EXCEEDED]: 'Chương trình vượt quá giới hạn thời gian ở test ẩn.',
    [CodeVerdict.RUNTIME_ERROR]: 'Chương trình gặp lỗi khi chạy test ẩn.',
    [CodeVerdict.COMPILATION_ERROR]: 'Mã nguồn không biên dịch được.',
    [CodeVerdict.INTERNAL_ERROR]: 'Máy chấm gặp lỗi khi xử lý test ẩn.',
  };
  return messages[verdict];
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}
