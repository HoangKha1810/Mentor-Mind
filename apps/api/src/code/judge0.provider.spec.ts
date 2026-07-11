import { ConfigService } from '@nestjs/config';
import { CodeLanguage, CodeVerdict } from '@prisma/client';
import { codingLanguageOptions, codingLanguageStarterCode } from '@mentormind/shared';
import { JudgeRequest } from './code-judge.interface';
import { Judge0Provider } from './judge0.provider';

const originalFetch = global.fetch;

const request: JudgeRequest = {
  language: CodeLanguage.JAVASCRIPT,
  code: "process.stdout.write(require('fs').readFileSync(0, 'utf8').trim())",
  testCases: [{ input: 'hello\n', expectedOutput: 'hello', isHidden: false }],
  timeLimitMs: 1000,
  memoryLimitMb: 128,
};

describe('Judge0Provider', () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it.each(codingLanguageOptions)(
    'submits $label with Judge0 language id $judge0Id',
    async (option) => {
      fetchMock.mockResolvedValue(
        judgeResponse({
          stdout: base64('hello'),
          time: '0.014',
          memory: 2048,
          status: { id: 3, description: 'Accepted' },
        }),
      );
      const provider = createProvider();

      const result = await provider.run({
        ...request,
        language: option.value as CodeLanguage,
        code: codingLanguageStarterCode[option.value],
      });

      const [, init] = fetchMock.mock.calls[0] ?? [];
      const [url] = fetchMock.mock.calls[0] ?? [];
      const body = JSON.parse(String(init?.body)) as {
        language_id: number;
        source_code: string;
        stdin: string;
        expected_output: string;
      };
      expect(String(url)).toContain('base64_encoded=true');
      expect(body.language_id).toBe(option.judge0Id);
      expect(fromBase64(body.source_code)).toBe(codingLanguageStarterCode[option.value]);
      expect(fromBase64(body.stdin)).toBe(request.testCases[0]?.input);
      expect(fromBase64(body.expected_output)).toBe(request.testCases[0]?.expectedOutput);
      expect(result.verdict).toBe(CodeVerdict.ACCEPTED);
      expect(result.publicResults?.[0]).toMatchObject({
        actualOutput: 'hello',
        stdout: 'hello',
        verdict: CodeVerdict.ACCEPTED,
        passed: true,
        runtimeMs: 14,
        memoryKb: 2048,
      });
    },
  );

  it('polls a token-only response until Judge0 finishes', async () => {
    fetchMock
      .mockResolvedValueOnce(judgeResponse({ token: 'submission-token' }))
      .mockResolvedValueOnce(
        judgeResponse({
          token: 'submission-token',
          status: { id: 2, description: 'Processing' },
        }),
      )
      .mockResolvedValueOnce(
        judgeResponse({
          token: 'submission-token',
          stdout: base64('hello'),
          status: { id: 3, description: 'Accepted' },
        }),
      );

    const result = await createProvider().run(request);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/submissions/submission-token');
    expect(fetchMock.mock.calls[1]?.[0]).toContain('base64_encoded=true');
    expect(result.verdict).toBe(CodeVerdict.ACCEPTED);
    expect(result.publicResults?.[0]?.actualOutput).toBe('hello');
  });

  it('decodes and sanitizes compilation diagnostics', async () => {
    fetchMock.mockResolvedValue(
      judgeResponse({
        stdout: null,
        stderr: base64('compiler stderr'),
        compile_output: base64('\u001b[31mMain.java:4: error: missing return\u001b[0m'),
        status: { id: 6, description: 'Compilation Error' },
      }),
    );

    const result = await createProvider().run(request);

    expect(result.verdict).toBe(CodeVerdict.COMPILATION_ERROR);
    expect(result.errorMessage).toBe('Main.java:4: error: missing return');
    expect(result.compileOutput).toBe('Main.java:4: error: missing return');
    expect(result.stderr).toBe('compiler stderr');
    expect(result.publicResults?.[0]).toMatchObject({
      actualOutput: '',
      passed: false,
      verdict: CodeVerdict.COMPILATION_ERROR,
      compileOutput: 'Main.java:4: error: missing return',
    });
  });

  it('exposes a decoded Judge0 internal error instead of an empty result', async () => {
    fetchMock.mockResolvedValue(
      judgeResponse({
        message: base64('Sandbox worker is temporarily unavailable'),
        status: { id: 13, description: 'Internal Error' },
      }),
    );

    const result = await createProvider().run(request);

    expect(result.verdict).toBe(CodeVerdict.INTERNAL_ERROR);
    expect(result.errorMessage).toBe('Sandbox worker is temporarily unavailable');
    expect(result.publicResults?.[0]?.errorMessage).toBe(
      'Sandbox worker is temporarily unavailable',
    );
  });

  it('preserves unicode source and input through base64 transport', async () => {
    fetchMock.mockResolvedValue(
      judgeResponse({
        stdout: base64('xin chào'),
        time: '0.011',
        memory: 1024,
        status: { id: 3, description: 'Accepted' },
      }),
    );

    const result = await createProvider().run({
      ...request,
      language: CodeLanguage.PYTHON,
      code: 'print(input().strip())  # tiếng Việt',
      testCases: [{ input: 'xin chào\n', expectedOutput: 'xin chào', isHidden: false }],
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body)) as {
      source_code: string;
      stdin: string;
      expected_output: string;
    };
    expect(String(url)).toContain('base64_encoded=true');
    expect(fromBase64(body.source_code)).toBe('print(input().strip())  # tiếng Việt');
    expect(fromBase64(body.stdin)).toBe('xin chào\n');
    expect(fromBase64(body.expected_output)).toBe('xin chào');
    expect(result.verdict).toBe(CodeVerdict.ACCEPTED);
    expect(result.publicResults?.[0]).toMatchObject({
      actualOutput: 'xin chào',
      passed: true,
      runtimeMs: 11,
      memoryKb: 1024,
    });
  });

  it.each([
    [CodeLanguage.JAVASCRIPT, 'script.js'],
    [CodeLanguage.TYPESCRIPT, 'script.ts'],
    [CodeLanguage.PYTHON, 'script.py'],
    [CodeLanguage.JAVA, 'Main.java'],
    [CodeLanguage.CPP, 'main.cpp'],
  ])('reports a %s sandbox initialization failure without retrying', async (language, fileName) => {
    fetchMock.mockResolvedValue(
      judgeResponse({
        message: base64(`No such file or directory @ rb_sysopen - /box/${fileName}`),
        status: { id: 13, description: 'Internal Error' },
      }),
    );

    const result = await createProvider().run({
      ...request,
      language,
      code: codingLanguageStarterCode[language],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.verdict).toBe(CodeVerdict.INTERNAL_ERROR);
    expect(result.statusDescription).toBe('Judge0 Sandbox Unavailable');
    expect(result.errorMessage).toBe(
      'Máy chấm không thể khởi tạo môi trường chạy code. Vui lòng thử lại sau.',
    );
    expect(result.publicResults?.[0]).toMatchObject({
      actualOutput: '',
      passed: false,
      verdict: CodeVerdict.INTERNAL_ERROR,
      statusDescription: 'Judge0 Sandbox Unavailable',
    });
  });

  it('returns a structured result when the Judge0 HTTP request fails', async () => {
    fetchMock.mockResolvedValue(judgeResponse({ message: 'upstream unavailable' }, 502));

    const result = await createProvider().run(request);

    expect(result.verdict).toBe(CodeVerdict.INTERNAL_ERROR);
    expect(result.errorMessage).toContain('Judge0 HTTP 502: upstream unavailable');
    expect(result.publicResults?.[0]).toMatchObject({
      actualOutput: '',
      passed: false,
      verdict: CodeVerdict.INTERNAL_ERROR,
    });
  });

  it('does not expose hidden test input or output in public results', async () => {
    fetchMock
      .mockResolvedValueOnce(
        judgeResponse({ stdout: base64('hello'), status: { id: 3, description: 'Accepted' } }),
      )
      .mockResolvedValueOnce(
        judgeResponse({
          stdout: base64('secret'),
          stderr: base64('leaked hidden-input'),
          compile_output: base64('leaked hidden-output'),
          status: { id: 7, description: 'Runtime Error (NZEC)' },
        }),
      )
      .mockResolvedValueOnce(
        judgeResponse({
          stdout: base64('public-wrong'),
          status: { id: 4, description: 'Wrong Answer' },
        }),
      );

    const result = await createProvider().run({
      ...request,
      testCases: [
        ...request.testCases,
        { input: 'hidden-input', expectedOutput: 'hidden-output', isHidden: true },
        { input: 'public-input-2', expectedOutput: 'public-output-2', isHidden: false },
      ],
    });

    expect(result.totalTests).toBe(3);
    expect(result.passedTests).toBe(1);
    expect(result.verdict).toBe(CodeVerdict.RUNTIME_ERROR);
    expect(result.errorMessage).toBe('Chương trình gặp lỗi khi chạy test ẩn.');
    expect(result.stderr).toBeUndefined();
    expect(result.compileOutput).toBeUndefined();
    expect(result.publicResults).toHaveLength(2);
    expect(JSON.stringify(result.publicResults)).not.toContain('hidden-input');
    expect(JSON.stringify(result.publicResults)).not.toContain('hidden-output');
    expect(JSON.stringify(result)).not.toContain('leaked');
  });

  it('reports missing Judge0 configuration without making a request', async () => {
    const provider = new Judge0Provider({ get: () => undefined } as unknown as ConfigService);

    const result = await provider.run(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.verdict).toBe(CodeVerdict.INTERNAL_ERROR);
    expect(result.errorMessage).toContain('JUDGE0_BASE_URL');
    expect(result.publicResults?.[0]?.passed).toBe(false);
  });
});

function createProvider() {
  return new Judge0Provider(
    new ConfigService({
      JUDGE0_BASE_URL: 'http://judge0.test/',
      JUDGE0_POLL_INTERVAL_MS: 0,
      JUDGE0_MAX_POLL_ATTEMPTS: 4,
    }),
  );
}

function judgeResponse(body: object, status = 201) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

function base64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function fromBase64(value: string) {
  return Buffer.from(value, 'base64').toString('utf8');
}
