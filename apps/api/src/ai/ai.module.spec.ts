import { ConfigService } from '@nestjs/config';
import { selectAiProvider } from './ai.module';
import { MockAIProvider } from './mock-ai.provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

describe('selectAiProvider', () => {
  const mock = { name: 'mock' } as MockAIProvider;
  const openai = { name: 'openai-compatible' } as OpenAICompatibleProvider;

  it('allows mock only when it is explicit outside production', () => {
    expect(selectAiProvider(config({ NODE_ENV: 'test', AI_PROVIDER: 'mock' }), mock, openai)).toBe(
      mock,
    );
  });

  it('rejects an implicit provider outside production', () => {
    expect(() => selectAiProvider(config({ NODE_ENV: 'test' }), mock, openai)).toThrow(
      'AI_PROVIDER must be explicitly set',
    );
  });

  it('rejects a missing runtime environment instead of assuming development', () => {
    expect(() => selectAiProvider(config({ AI_PROVIDER: 'mock' }), mock, openai)).toThrow(
      'NODE_ENV must be explicitly set',
    );
  });

  it('rejects mock in production', () => {
    expect(() =>
      selectAiProvider(config({ NODE_ENV: 'production', AI_PROVIDER: 'mock' }), mock, openai),
    ).toThrow('Production requires AI_PROVIDER=openai');
  });

  it('requires a key whenever the OpenAI-compatible provider is selected', () => {
    expect(() =>
      selectAiProvider(config({ NODE_ENV: 'test', AI_PROVIDER: 'openai' }), mock, openai),
    ).toThrow('AI_API_KEY is required');
  });

  it('requires an explicit endpoint and model in production', () => {
    expect(() =>
      selectAiProvider(
        config({ NODE_ENV: 'production', AI_PROVIDER: 'openai', AI_API_KEY: 'secret' }),
        mock,
        openai,
      ),
    ).toThrow('AI_BASE_URL is required');
  });

  it('selects a fully configured real provider in production', () => {
    expect(
      selectAiProvider(
        config({
          NODE_ENV: 'production',
          AI_PROVIDER: 'openai',
          AI_API_KEY: 'secret',
          AI_BASE_URL: 'https://api.openai.com/v1',
          AI_MODEL: 'gpt-4.1-mini',
        }),
        mock,
        openai,
      ),
    ).toBe(openai);
  });
});

function config(values: Record<string, string>) {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}
