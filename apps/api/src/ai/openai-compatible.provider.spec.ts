import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

const originalFetch = global.fetch;

describe('OpenAICompatibleProvider', () => {
  let fetchMock: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('throws instead of returning synthetic output when the API key is missing', async () => {
    const provider = createProvider({});

    await expect(provider.generateText({ prompt: 'hello', fallback: 'synthetic' })).rejects.toThrow(
      'AI_API_KEY is required',
    );
    await expect(provider.generateEmbedding('hello')).rejects.toThrow('AI_API_KEY is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws instead of using fallback when the provider returns no completion', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ choices: [] }));
    const provider = createProvider({ AI_API_KEY: 'secret' });

    await expect(provider.generateText({ prompt: 'hello', fallback: 'synthetic' })).rejects.toThrow(
      'empty completion',
    );
  });

  it('sends the task system prompt and temperature for structured output', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        choices: [{ message: { content: '{"score":1}' } }],
        usage: { prompt_tokens: 10, completion_tokens: 3 },
      }),
    );
    const provider = createProvider({
      AI_API_KEY: 'secret',
      AI_BASE_URL: 'https://provider.test/v1/',
      AI_MODEL: 'real-model',
    });

    const result = await provider.generateJson({
      prompt: 'Evaluate the answer.',
      systemPrompt: 'Strict interview evaluator.',
      temperature: 0,
      schema: z.object({ score: z.number() }),
      fallback: { score: 7 },
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    const body = JSON.parse(String(init?.body)) as {
      temperature: number;
      messages: Array<{ role: string; content: string }>;
    };
    expect(url).toBe('https://provider.test/v1/chat/completions');
    expect(body.temperature).toBe(0);
    expect(body.messages[0]).toEqual({
      role: 'system',
      content: 'Strict interview evaluator.',
    });
    expect(result.data).toEqual({ score: 1 });
  });
});

function createProvider(values: Record<string, string>) {
  const config = { get: (key: string) => values[key] } as unknown as ConfigService;
  return new OpenAICompatibleProvider(config);
}

function jsonResponse(body: object) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
