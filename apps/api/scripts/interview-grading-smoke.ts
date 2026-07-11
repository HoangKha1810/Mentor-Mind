import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../src/ai/ai-provider.interface';
import { selectAiProvider } from '../src/ai/ai.module';
import {
  INTERVIEW_EVALUATION_SYSTEM_PROMPT,
  buildInterviewEvaluationPrompt,
  createInterviewEvaluationFallback,
  normalizeInterviewEvaluation,
} from '../src/ai/interview-evaluation.policy';
import { OpenAICompatibleProvider } from '../src/ai/openai-compatible.provider';
import { MockAIProvider } from '../src/ai/mock-ai.provider';
import { interviewEvaluationSchema } from '../src/ai/schemas/interview.schema';

const config = new ConfigService();

function requireConfig(name: 'AI_API_KEY' | 'AI_BASE_URL' | 'AI_MODEL') {
  const value = config.get<string>(name)?.trim();
  if (!value) {
    throw new Error(`${name} is required for the real AI grading smoke test.`);
  }
  return value;
}

function assertRealAiConfiguration() {
  if (config.get<string>('AI_PROVIDER')?.trim().toLowerCase() !== 'openai') {
    throw new Error('AI_PROVIDER must be set to openai.');
  }

  const apiKey = requireConfig('AI_API_KEY');
  const baseUrl = requireConfig('AI_BASE_URL');
  const model = requireConfig('AI_MODEL');

  if (!/^https?:\/\//i.test(baseUrl)) {
    throw new Error('AI_BASE_URL must be an HTTP(S) endpoint.');
  }
  if (/^(changeme|replace-me|test|mock)$/i.test(apiKey) || /mock/i.test(model)) {
    throw new Error('A real AI_API_KEY and non-mock AI_MODEL are required.');
  }

  return { model };
}

const question =
  'Hãy trình bày một kinh nghiệm quan trọng liên quan đến vị trí AI Research Intern.';

const commonInput = {
  targetRole: 'AI Research Intern',
  level: 'Intern',
  mode: 'BEHAVIORAL',
  question,
};

const scenarios = [
  {
    name: 'greeting-only',
    answer: 'Hi',
  },
  {
    name: 'substantive-star-answer',
    answer:
      'Trong đồ án phân loại ảnh y khoa, dữ liệu huấn luyện bị mất cân bằng khiến baseline ResNet18 chỉ đạt macro F1 0,61. Tôi chịu trách nhiệm thiết kế thí nghiệm và tránh rò rỉ dữ liệu. Tôi chia tập theo bệnh nhân, dùng class-weighted loss, augmentation chỉ trên tập train và theo dõi từng lần chạy. Sau khi ablation, macro F1 trên tập validation tăng lên 0,74 mà không làm giảm recall của lớp hiếm. Kinh nghiệm này giúp tôi hiểu rằng một cải tiến nghiên cứu phải đi kèm baseline rõ ràng, metric phù hợp và thí nghiệm có thể tái lập.',
  },
] as const;

async function grade(provider: AIProvider, scenario: (typeof scenarios)[number]) {
  const input = { ...commonInput, answer: scenario.answer };
  const result = await provider.generateJson({
    systemPrompt: INTERVIEW_EVALUATION_SYSTEM_PROMPT,
    prompt: buildInterviewEvaluationPrompt(input),
    schema: interviewEvaluationSchema,
    fallback: createInterviewEvaluationFallback(scenario.answer, question),
    temperature: 0,
  });
  const evaluation = normalizeInterviewEvaluation(scenario.answer, result.data);

  console.log(`${scenario.name}: ${evaluation.score}/10 (${result.model})`);
  return evaluation;
}

async function main() {
  const { model } = assertRealAiConfiguration();
  const openai = new OpenAICompatibleProvider(config);
  const provider = selectAiProvider(config, new MockAIProvider(), openai);

  console.log(`Running real interview grading smoke with ${provider.name}/${model}.`);

  const bad = await grade(provider, scenarios[0]);
  const strong = await grade(provider, scenarios[1]);

  if (bad.score > 1) {
    throw new Error(`Greeting-only answer scored ${bad.score}; expected at most 1.`);
  }
  if (
    strong.score < 7 ||
    strong.rubric.relevance < 7 ||
    strong.rubric.depth < 6 ||
    strong.rubric.examples < 6
  ) {
    throw new Error(
      `Substantive answer quality was too low: score=${strong.score}, relevance=${strong.rubric.relevance}, depth=${strong.rubric.depth}, examples=${strong.rubric.examples}.`,
    );
  }

  console.log('Real interview grading smoke passed.');
}

main().catch((error: unknown) => {
  const apiKey = config.get<string>('AI_API_KEY') ?? '';
  const rawMessage = error instanceof Error ? error.message : 'Unknown smoke test failure.';
  const safeMessage = apiKey ? rawMessage.replaceAll(apiKey, '[REDACTED]') : rawMessage;
  console.error(`Real interview grading smoke failed: ${safeMessage}`);
  process.exitCode = 1;
});
