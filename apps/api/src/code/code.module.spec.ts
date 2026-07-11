import { ConfigService } from '@nestjs/config';
import { selectCodeJudgeProvider } from './code.module';
import { Judge0Provider } from './judge0.provider';
import { MockJudgeProvider } from './mock-judge.provider';

describe('selectCodeJudgeProvider', () => {
  const mock = { name: 'mock' } as MockJudgeProvider;
  const judge0 = { name: 'judge0' } as Judge0Provider;

  it('allows mock only when it is explicit outside production', () => {
    expect(
      selectCodeJudgeProvider(config({ NODE_ENV: 'test', JUDGE_PROVIDER: 'mock' }), mock, judge0),
    ).toBe(mock);
  });

  it('rejects an implicit provider outside production', () => {
    expect(() => selectCodeJudgeProvider(config({ NODE_ENV: 'test' }), mock, judge0)).toThrow(
      'JUDGE_PROVIDER must be explicitly set',
    );
  });

  it('rejects a missing runtime environment instead of assuming development', () => {
    expect(() => selectCodeJudgeProvider(config({ JUDGE_PROVIDER: 'mock' }), mock, judge0)).toThrow(
      'NODE_ENV must be explicitly set',
    );
  });

  it('rejects mock in production', () => {
    expect(() =>
      selectCodeJudgeProvider(
        config({ NODE_ENV: 'production', JUDGE_PROVIDER: 'mock' }),
        mock,
        judge0,
      ),
    ).toThrow('Production requires JUDGE_PROVIDER=judge0');
  });

  it('requires a real Judge0 endpoint whenever Judge0 is selected', () => {
    expect(() =>
      selectCodeJudgeProvider(
        config({ NODE_ENV: 'development', JUDGE_PROVIDER: 'judge0' }),
        mock,
        judge0,
      ),
    ).toThrow('JUDGE0_BASE_URL is required');
  });

  it('selects a configured Judge0 provider in production', () => {
    expect(
      selectCodeJudgeProvider(
        config({
          NODE_ENV: 'production',
          JUDGE_PROVIDER: 'judge0',
          JUDGE0_BASE_URL: 'http://127.0.0.1:2358',
        }),
        mock,
        judge0,
      ),
    ).toBe(judge0);
  });
});

function config(values: Record<string, string>) {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}
