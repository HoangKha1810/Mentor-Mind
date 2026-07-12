import { ConfigService } from '@nestjs/config';
import { selectAiProvider } from '../src/ai/ai.module';
import {
  LEARNING_ASSISTANT_SYSTEM_PROMPT,
  buildLearningAssistantPrompt,
  createDefaultLearningAssistantClientContext,
} from '../src/ai/learning-assistant.policy';
import { MockAIProvider } from '../src/ai/mock-ai.provider';
import { OpenAICompatibleProvider } from '../src/ai/openai-compatible.provider';

const config = new ConfigService();

function requireConfig(name: 'AI_API_KEY' | 'AI_BASE_URL' | 'AI_MODEL') {
  const value = config.get<string>(name)?.trim();
  if (!value) throw new Error(`${name} is required for the real learning assistant smoke test.`);
  return value;
}

function assertRealAiConfiguration() {
  if (config.get<string>('AI_PROVIDER')?.trim().toLowerCase() !== 'openai') {
    throw new Error('AI_PROVIDER must be set to openai.');
  }

  const apiKey = requireConfig('AI_API_KEY');
  const baseUrl = requireConfig('AI_BASE_URL');
  const model = requireConfig('AI_MODEL');
  if (!/^https?:\/\//i.test(baseUrl)) throw new Error('AI_BASE_URL must be an HTTP(S) endpoint.');
  if (/^(changeme|replace-me|test|mock)$/i.test(apiKey) || /mock/i.test(model)) {
    throw new Error('A real AI_API_KEY and non-mock AI_MODEL are required.');
  }

  return { apiKey, model };
}

async function main() {
  const { model } = assertRealAiConfiguration();
  const provider = selectAiProvider(
    config,
    new MockAIProvider(),
    new OpenAICompatibleProvider(config),
  );
  const clientContext = createDefaultLearningAssistantClientContext();
  const prompt = buildLearningAssistantPrompt({
    templateInstruction:
      'Giúp học viên biến mục tiêu thành các hành động ngắn, có thứ tự và có thể kiểm chứng.',
    clientContext,
    serverContext: {
      profile: { targetRole: 'AI Research Intern', weeklyHours: 10 },
      activeRoadmap: { title: 'Nền tảng nghiên cứu AI', durationWeeks: 4 },
    },
    history: '',
    rememberedFacts: [],
    message:
      'Hãy trả lời bằng Markdown với một heading, đúng 3 bước đánh số và một code fence markdown chứa mẫu checklist ngắn.',
  });

  console.log(`Running real learning assistant smoke with ${provider.name}/${model}.`);
  const result = await provider.generateText({
    prompt,
    systemPrompt: LEARNING_ASSISTANT_SYSTEM_PROMPT,
  });
  const response = result.data.trim();
  const checks = {
    paragraphs: response.includes('\n\n'),
    heading: /^#{1,5}\s+\S/m.test(response),
    list: /^\s*\d+\.\s+\S/m.test(response),
    codeFence: /```[\w-]*\n[\s\S]+?```/m.test(response),
  };

  if (Object.values(checks).some((passed) => !passed)) {
    throw new Error(`Markdown structure check failed: ${JSON.stringify(checks)}`);
  }

  console.log(`Real learning assistant Markdown smoke passed (${result.model}).`);
}

main().catch((error: unknown) => {
  const apiKey = config.get<string>('AI_API_KEY') ?? '';
  const rawMessage = error instanceof Error ? error.message : 'Unknown smoke test failure.';
  const safeMessage = apiKey ? rawMessage.replaceAll(apiKey, '[REDACTED]') : rawMessage;
  console.error(`Real learning assistant smoke failed: ${safeMessage}`);
  process.exitCode = 1;
});
