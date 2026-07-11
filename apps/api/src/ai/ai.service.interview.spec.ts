import { ServiceUnavailableException } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';
import { AiService } from './ai.service';
import { AIUsageService } from './ai-usage.service';
import { PromptTemplateService } from './prompt-template.service';
import type { InterviewEvaluation } from './schemas/interview.schema';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

const interviewInput = {
  targetRole: 'AI Research Intern',
  level: 'Intern',
  mode: 'TECHNICAL',
  question: 'Describe an important experience related to this role.',
  answer: 'Hi',
};

function allTensEvaluation(): InterviewEvaluation {
  return {
    score: 10,
    strengths: ['Strong technical depth'],
    weaknesses: [],
    betterAnswer: 'A model answer.',
    nextPracticeSuggestion: 'Continue practising.',
    rubric: {
      correctness: 10,
      clarity: 10,
      structure: 10,
      depth: 10,
      relevance: 10,
      confidence: 10,
      examples: 10,
      communication: 10,
      roleFit: 10,
    },
  };
}

function createSubject() {
  const providerGenerateJson = jest.fn();
  const usageLog = jest.fn().mockResolvedValue(undefined);
  const ensureAiToolAllowed = jest.fn().mockResolvedValue(undefined);
  const findSetting = jest.fn().mockResolvedValue(null);

  const provider = {
    name: 'real-provider',
    model: 'real-model',
    generateJson: providerGenerateJson,
    generateText: jest.fn(),
    generateEmbedding: jest.fn(),
    estimateCost: jest.fn().mockReturnValue(0),
  } as unknown as AIProvider;
  const prompts = {
    getActiveTemplate: jest.fn().mockResolvedValue('Evaluate {{answer}}.'),
    render: jest.fn(
      (_template: string, variables: Record<string, unknown>) =>
        `Evaluate ${String(variables.answer ?? '')}.`,
    ),
  } as unknown as PromptTemplateService;
  const usage = { log: usageLog } as unknown as AIUsageService;
  const prisma = {
    aISetting: { findUnique: findSetting },
  } as unknown as PrismaService;
  const entitlements = {
    ensureAiToolAllowed,
  } as unknown as EntitlementsService;

  return {
    service: new AiService(provider, prompts, usage, prisma, entitlements),
    providerGenerateJson,
    usageLog,
    ensureAiToolAllowed,
  };
}

describe('AiService interview evaluation', () => {
  it('fails closed after two provider failures', async () => {
    const subject = createSubject();
    subject.providerGenerateJson
      .mockRejectedValueOnce(new Error('provider unavailable'))
      .mockRejectedValueOnce(new Error('retry unavailable'));

    await expect(
      subject.service.evaluateInterviewAnswer('student-id', interviewInput),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(subject.providerGenerateJson).toHaveBeenCalledTimes(2);
    expect(subject.usageLog).toHaveBeenCalledTimes(1);
    expect(subject.usageLog).toHaveBeenCalledWith(
      expect.objectContaining({
        feature: 'INTERVIEW_ANSWER_EVALUATION',
        provider: expect.objectContaining({ name: 'real-provider' }),
        status: 'FAILED',
      }),
    );
  });

  it('does not use mock fallback for other structured features with a real provider', async () => {
    const subject = createSubject();
    subject.providerGenerateJson.mockRejectedValue(new Error('provider unavailable'));

    await expect(
      subject.service.generateInterviewQuestions('student-id', {
        targetRole: 'AI Research Intern',
        level: 'Intern',
        mode: 'TECHNICAL',
        jdText: 'Research and evaluate machine learning systems.',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(subject.providerGenerateJson).toHaveBeenCalledTimes(2);
  });

  it('normalizes an all-10 provider result for Hi down to 1', async () => {
    const subject = createSubject();
    subject.providerGenerateJson.mockResolvedValue({
      data: allTensEvaluation(),
      usage: { promptTokens: 100, completionTokens: 50 },
      provider: 'real-provider',
      model: 'real-model',
      latencyMs: 25,
    });

    const result = await subject.service.evaluateInterviewAnswer('student-id', interviewInput);

    expect(subject.providerGenerateJson).toHaveBeenCalledTimes(1);
    expect(result.score).toBe(1);
    expect(result.strengths).toEqual([]);
    expect(Object.values(result.rubric).every((score) => score <= 1)).toBe(true);
  });
});
