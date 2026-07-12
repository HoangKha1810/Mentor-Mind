import { AIProvider } from './ai-provider.interface';
import { AiService } from './ai.service';
import { AIUsageService } from './ai-usage.service';
import { LEARNING_ASSISTANT_SYSTEM_PROMPT } from './learning-assistant.policy';
import { PromptTemplateService } from './prompt-template.service';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementsService } from '../entitlements/entitlements.service';

function createClientContext() {
  return {
    version: 2,
    trigger: 'idle-hint',
    route: '/dashboard/roadmaps/request-1',
    idleSeconds: 40,
    observedAt: '2026-07-12T00:00:00.000Z',
    page: {
      surface: 'roadmap',
      source: 'roadmap-detail',
      routeKey: '/dashboard/roadmaps/request-1',
      title: 'Lộ trình AI Research Intern',
      updatedAt: '2026-07-12T00:00:00.000Z',
      roadmap: {
        requestId: 'request-1',
        targetRole: 'AI Research Intern',
        goal: 'Hoàn thiện đề tài nghiên cứu',
        weeks: [{ weekNumber: 1, title: 'Xác định đề tài', topics: 'Literature review' }],
      },
    },
    related: { account: null, latestCvReview: null, latestInterview: null },
    verifiedResources: [],
  };
}

describe('AiService learning assistant', () => {
  it('sends page-first context and the dedicated system policy to the provider', async () => {
    const generateText = jest.fn().mockResolvedValue({
      data: 'Hãy bắt đầu từ phần literature review của tuần 1.',
      usage: { promptTokens: 100, completionTokens: 20 },
      provider: 'real-provider',
      model: 'real-model',
      latencyMs: 15,
    });
    const provider = {
      name: 'real-provider',
      model: 'real-model',
      generateText,
      generateJson: jest.fn(),
      generateEmbedding: jest.fn(),
      estimateCost: jest.fn().mockReturnValue(0),
    } as unknown as AIProvider;
    const prompts = {
      getActiveTemplate: jest.fn().mockResolvedValue('Hỗ trợ học viên theo đúng màn hình.'),
      render: jest.fn().mockReturnValue('Hỗ trợ học viên theo đúng màn hình.'),
    } as unknown as PromptTemplateService;
    const usage = { log: jest.fn().mockResolvedValue(undefined) } as unknown as AIUsageService;
    const createMany = jest.fn().mockResolvedValue({ count: 2 });
    const prisma = {
      aISetting: { findUnique: jest.fn().mockResolvedValue(null) },
      studentProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      roadmap: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'roadmap-1',
            title: 'AI Research Intern',
            status: 'ACTIVE',
            weeks: [{ weekNumber: 1, title: 'Xác định đề tài' }],
          },
        ]),
      },
      codeSubmission: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'submission-1', verdict: 'WRONG_ANSWER', problem: { title: 'Two Sum' } },
          ]),
      },
      interviewSession: { findMany: jest.fn().mockResolvedValue([]) },
      cvReview: { findFirst: jest.fn().mockResolvedValue(null) },
      aIConversation: {
        create: jest
          .fn()
          .mockResolvedValue({ id: 'conversation-1', title: 'Gợi ý bước tiếp theo' }),
        update: jest.fn().mockResolvedValue({ id: 'conversation-1' }),
      },
      aIMessage: { createMany },
      $transaction: jest.fn((operations: Array<Promise<unknown>>) => Promise.all(operations)),
    } as unknown as PrismaService;
    const entitlements = {
      ensureAiChatAllowed: jest.fn().mockResolvedValue(undefined),
    } as unknown as EntitlementsService;
    const service = new AiService(provider, prompts, usage, prisma, entitlements);

    await service.chat(
      'student-1',
      'Gợi ý bước tiếp theo trong lộ trình.',
      undefined,
      createClientContext(),
    );

    expect(generateText).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: LEARNING_ASSISTANT_SYSTEM_PROMPT }),
    );
    const prompt = generateText.mock.calls[0]?.[0]?.prompt as string;
    expect(prompt).toContain('CURRENT_PAGE:');
    expect(prompt).toContain('"surface":"roadmap"');
    expect(prompt).toContain('"title":"Two Sum"');
    expect(prompt.indexOf('CURRENT_PAGE:')).toBeLessThan(prompt.indexOf('SERVER_CONTEXT:'));

    const storedMessages = createMany.mock.calls[0]?.[0]?.data;
    expect(storedMessages[0].metadata.clientContext.page.roadmap.targetRole).toBe(
      'AI Research Intern',
    );
    expect(storedMessages[1].metadata.clientContext.page).toEqual(
      expect.objectContaining({ surface: 'roadmap', routeKey: '/dashboard/roadmaps/request-1' }),
    );
    expect(storedMessages[1].metadata.clientContext.page.roadmap).toBeUndefined();

    await service.chat('student-1', 'Client cũ không gửi context.');

    const legacyPrompt = generateText.mock.calls[1]?.[0]?.prompt as string;
    expect(legacyPrompt).toContain('"source":"server-default"');
    expect(legacyPrompt).not.toContain('"surface":"code"');
    const legacyStoredMessages = createMany.mock.calls[1]?.[0]?.data;
    expect(legacyStoredMessages[0].metadata.clientContext).toEqual(
      expect.objectContaining({
        version: 2,
        trigger: 'legacy-client',
        related: { account: null, latestCvReview: null, latestInterview: null },
      }),
    );

    const invalidContext = createClientContext();
    invalidContext.page.surface = 'code';
    const transaction = prisma.$transaction as jest.Mock;
    const transactionCallsBeforeInvalidRequest = transaction.mock.calls.length;

    await expect(
      service.chat('student-1', 'Context sai không được ghi nhớ.', undefined, invalidContext),
    ).rejects.toThrow('Page context surface does not match the current route');
    expect(transaction.mock.calls).toHaveLength(transactionCallsBeforeInvalidRequest);
    expect(generateText).toHaveBeenCalledTimes(2);
    expect(createMany).toHaveBeenCalledTimes(2);
  });
});
