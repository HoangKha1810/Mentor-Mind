import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AIMessage, AIUsageStatus, Prisma, PromptTemplate } from '@prisma/client';
import { z } from 'zod';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AIProvider } from './ai-provider.interface';
import { MockAIProvider } from './mock-ai.provider';
import { PromptTemplateService } from './prompt-template.service';
import { AIUsageService } from './ai-usage.service';
import { codingHintSchema, codeReviewSchema } from './schemas/code-review.schema';
import { cvReviewSchema } from './schemas/cv-review.schema';
import {
  interviewEvaluationSchema,
  interviewQuestionGenerationSchema,
} from './schemas/interview.schema';
import { resourceRecommendationSchema } from './schemas/resource.schema';
import { RoadmapDraft, roadmapDraftSchema } from './schemas/roadmap.schema';

export const AI_PROVIDER = Symbol('AI_PROVIDER');

const chatInputSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  conversationId: z.string().optional(),
  clientContext: z.unknown().optional(),
});

const memoryExtractionSchema = z.object({
  shouldRemember: z.boolean().default(false),
  profileUpdates: z
    .object({
      targetRole: z.string().nullable().optional(),
      currentLevel: z.string().nullable().optional(),
      goals: z.string().nullable().optional(),
      weeklyHours: z.number().int().positive().nullable().optional(),
      learningStyle: z.string().nullable().optional(),
      budgetRange: z.string().nullable().optional(),
      expectedSalary: z.string().nullable().optional(),
      preferredLocation: z.string().nullable().optional(),
      timezone: z.string().nullable().optional(),
      bio: z.string().nullable().optional(),
    })
    .default({}),
  personalContext: z.record(z.unknown()).default({}),
  rememberedFacts: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
});

type ProfileMemoryUpdates = Partial<{
  targetRole: string;
  currentLevel: string;
  goals: string;
  weeklyHours: number;
  learningStyle: string;
  budgetRange: string;
  expectedSalary: string;
  preferredLocation: string;
  timezone: string;
  bio: string;
}>;

type MemoryExtraction = {
  shouldRemember: boolean;
  profileUpdates: ProfileMemoryUpdates;
  personalContext: Record<string, unknown>;
  rememberedFacts: Array<{ label: string; value: string }>;
};

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    private readonly mockProvider: MockAIProvider,
    private readonly prompts: PromptTemplateService,
    private readonly usage: AIUsageService,
    private readonly prisma: PrismaService,
    private readonly entitlements: EntitlementsService,
  ) {}

  async generateRoadmapDraft(userId: string, input: Record<string, unknown>) {
    return this.runJson(
      'ROADMAP_GENERATION',
      'ROADMAP_GENERATION',
      input,
      roadmapDraftSchema,
      this.fallbackRoadmap(input),
      userId,
    );
  }

  async evaluateInterviewAnswer(userId: string, input: Record<string, unknown>) {
    return this.runJson(
      'INTERVIEW_ANSWER_EVALUATION',
      'INTERVIEW_ANSWER_EVALUATION',
      input,
      interviewEvaluationSchema,
      {
        score: 7,
        strengths: ['Mục tiêu trả lời rõ ràng', 'Có dùng từ vựng kỹ thuật liên quan'],
        weaknesses: ['Cần bổ sung ví dụ cụ thể', 'Nên nêu rõ các đánh đổi kỹ thuật hơn'],
        betterAnswer:
          'Câu trả lời tốt hơn nên định nghĩa ý chính, giải thích vì sao nó quan trọng, rồi liên hệ với một dự án cụ thể và các đánh đổi đã cân nhắc.',
        nextPracticeSuggestion:
          'Luyện trả lời theo cấu trúc Tình huống, Hành động, Kết quả và thêm một chi tiết kỹ thuật.',
        rubric: {
          correctness: 7,
          clarity: 7,
          structure: 6,
          depth: 6,
          relevance: 7,
          confidence: 7,
          examples: 5,
          communication: 7,
          roleFit: 7,
        },
      },
      userId,
    );
  }

  async generateInterviewQuestions(userId: string, input: Record<string, unknown>) {
    return this.runJson(
      'INTERVIEW_QUESTION_GENERATION',
      'INTERVIEW_QUESTION_GENERATION',
      input,
      interviewQuestionGenerationSchema,
      {
        questions: [
          {
            question: 'Walk me through a project where you made a technical trade-off.',
            category: 'PROJECT_DEFENSE',
            expectedPoints: ['Context', 'Trade-off', 'Result', 'Learning'],
          },
          {
            question: 'How would you debug a slow API endpoint?',
            category: 'BACKEND',
            expectedPoints: ['Measure', 'Profile', 'Database', 'Caching', 'Regression tests'],
          },
        ],
      },
      userId,
    );
  }

  async codingHint(userId: string, input: Record<string, unknown>) {
    const level = Math.min(Math.max(Number(input.hintLevel ?? 1), 1), 4);
    return this.runJson(
      'CODING_HINT',
      'CODING_HINT',
      { ...input, hintLevel: level },
      codingHintSchema,
      {
        hintLevel: level,
        hint:
          level === 1
            ? 'Identify the smallest state you need to remember while scanning the input.'
            : level === 2
              ? 'Consider a hash map or stack depending on whether you are matching values or brackets.'
              : level === 3
                ? 'Write pseudocode first: initialize state, loop, check condition, update state, return result.'
                : 'Compare your output for each sample test and inspect the first point where it diverges.',
        revealsSolution: level >= 4,
        nextAction: 'Run the public samples again after applying the hint.',
      },
      userId,
    );
  }

  async codeReview(userId: string, input: Record<string, unknown>) {
    return this.runJson(
      'CODE_REVIEW',
      'CODE_REVIEW',
      input,
      codeReviewSchema,
      {
        summary:
          'The code is readable enough for a first pass, but verify edge cases before submitting.',
        correctness:
          'Likely correct for simple samples if input parsing matches the problem format.',
        edgeCases: ['Empty input', 'Duplicate values', 'Maximum constraints'],
        readability: ['Use descriptive variable names', 'Keep parsing separate from core logic'],
        complexity: { time: 'O(n)', space: 'O(n)' },
        improvements: ['Add a helper for parsing', 'Return early for invalid inputs'],
        finalAdvice: 'Submit after running public samples and one custom edge case.',
      },
      userId,
    );
  }

  async recommendResources(userId: string | undefined, input: Record<string, unknown>) {
    return this.runJson(
      'RESOURCE_RECOMMENDATION',
      'RESOURCE_RECOMMENDATION',
      input,
      resourceRecommendationSchema,
      {
        recommendations: [
          {
            title: 'MDN JavaScript Guide',
            source: 'MDN',
            type: 'DOCUMENTATION',
            url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
            difficulty: 'BEGINNER',
            description: 'A reliable foundation for JavaScript concepts and browser APIs.',
            tags: ['javascript', 'web', 'fundamentals'],
            whyRecommended: 'It is accurate, maintained, and useful while building real projects.',
            isExternal: true,
          },
        ],
      },
      userId,
    );
  }

  async reviewCv(userId: string, input: Record<string, unknown>) {
    return this.runJson(
      'CV_REVIEW',
      'CV_REVIEW',
      input,
      cvReviewSchema,
      {
        overallScore: 72,
        strengths: [
          'Thể hiện được vai trò trong dự án',
          'Tech stack liên quan đến vị trí mục tiêu',
        ],
        weaknesses: ['Chỉ số tác động còn mơ hồ', 'Thiếu keyword đúng với JD/vai trò mục tiêu'],
        missingKeywords: ['testing', 'performance', 'accessibility', 'deployment'],
        projectSuggestions: [
          'Bổ sung một dự án gần production có xác thực, database, test và deployment',
        ],
        betterBulletPoints: [
          'Xây dựng dashboard React có phân quyền theo vai trò, giúp giảm 30% thời gian theo dõi thủ công.',
        ],
        interviewRiskAreas: [
          'Giải thích trade-off thiết kế hệ thống',
          'Trình bày tác động sản phẩm/kinh doanh',
        ],
        recommendedTutoringPackage: 'Coaching CV và Portfolio',
        recommendedRoadmapItems: [
          'Viết lại bullet dự án',
          'Bổ sung ghi chú deployment',
          'Luyện phỏng vấn thử',
        ],
      },
      userId,
    );
  }

  async chat(
    userId: string,
    rawMessage: string,
    conversationId?: string,
    rawClientContext?: unknown,
  ) {
    await this.ensureFeatureAllowed('LEARNING_ASSISTANT', userId);
    const body = chatInputSchema.parse({
      message: rawMessage,
      conversationId,
      clientContext: rawClientContext,
    });
    const conversation = body.conversationId
      ? await this.prisma.aIConversation.findFirst({ where: { id: body.conversationId, userId } })
      : null;
    const previousMessages = conversation
      ? await this.prisma.aIMessage.findMany({
          where: { conversationId: conversation.id },
          orderBy: { createdAt: 'desc' },
          take: 12,
        })
      : [];

    const contextBefore = await this.loadStudentContext(userId);
    const contextUpdates = await this.extractAndStoreContext(
      userId,
      body.message,
      contextBefore.profile,
    );
    const context = await this.loadStudentContext(userId);
    const template = await this.prompts.getActiveTemplate('LEARNING_ASSISTANT');
    const clientContextForPrompt = this.stringifyForPrompt(body.clientContext);
    const prompt = `${this.prompts.render(template, {
      message: body.message,
      context,
      history: this.formatConversationHistory(previousMessages),
      contextUpdates,
      clientContext: body.clientContext,
    })}

Bạn là trợ lý học tập AI của MentorMind. Hãy trả lời bằng Tiếng Việt tự nhiên, giống một cuộc chat với mentor kỹ thuật.
Ngữ cảnh tài khoản hiện tại: ${JSON.stringify(context)}
Ngữ cảnh quan sát từ giao diện hiện tại: ${clientContextForPrompt}
Lịch sử hội thoại gần nhất: ${this.formatConversationHistory(previousMessages)}
Thông tin vừa ghi nhớ từ tin nhắn mới: ${JSON.stringify(contextUpdates.rememberedFacts)}
Tin nhắn mới của học viên: ${body.message}

Quy tắc:
- Trả lời trực tiếp, hữu ích, có bước tiếp theo rõ ràng.
- Nếu ngữ cảnh giao diện có code, câu hỏi phỏng vấn, CV/JD hoặc điểm gần nhất, hãy dùng nó để cá nhân hóa câu trả lời.
- Khi học viên xin hint code hoặc phỏng vấn, chỉ gợi ý nhẹ và tránh đưa lời giải đầy đủ trừ khi học viên yêu cầu rõ.
- Nếu ngữ cảnh cho thấy học viên vừa hoàn thành code/phỏng vấn/CV, hãy gợi ý tài liệu và bước học tiếp theo.
- Nếu vừa ghi nhớ thông tin mới như lương, địa điểm, lịch học, mục tiêu, hãy xác nhận ngắn gọn.
- Không bịa dữ liệu nền tảng nếu context chưa có.`;
    const result = await this.provider.generateText({
      prompt,
      fallback:
        'Mình đã nhận câu hỏi của bạn. Dựa trên ngữ cảnh hiện tại, hãy chọn một bước nhỏ có thể làm ngay trong tuần này và lưu lại điểm còn vướng để trao đổi với mentor.',
    });
    await this.usage.log({
      userId,
      feature: 'LEARNING_ASSISTANT',
      provider: this.provider,
      usage: result.usage,
      status: AIUsageStatus.SUCCESS,
      latencyMs: result.latencyMs,
    });

    const thread =
      conversation ??
      (await this.prisma.aIConversation.create({
        data: { userId, title: body.message.slice(0, 80), type: 'GENERAL' },
      }));

    await this.prisma.$transaction([
      this.prisma.aIMessage.createMany({
        data: [
          {
            conversationId: thread.id,
            role: 'USER',
            content: body.message,
            metadata: {
              contextUpdates,
              clientContext: this.toJsonValue(body.clientContext ?? {}),
            } as Prisma.InputJsonValue,
          },
          {
            conversationId: thread.id,
            role: 'ASSISTANT',
            content: result.data,
            metadata: {
              context,
              contextUpdates,
              clientContext: this.toJsonValue(body.clientContext ?? {}),
            } as Prisma.InputJsonValue,
          },
        ],
      }),
      this.prisma.aIConversation.update({
        where: { id: thread.id },
        data: { updatedAt: new Date(), title: thread.title || body.message.slice(0, 80) },
      }),
    ]);
    return { conversationId: thread.id, message: result.data, contextUpdates };
  }

  async listPromptTemplates() {
    return this.prompts.list();
  }

  async updatePromptTemplate(actorId: string, id: string, input: Partial<PromptTemplate>) {
    return this.prisma.promptTemplate.update({
      where: { id },
      data: {
        template: input.template,
        description: input.description,
        isActive: input.isActive,
        updatedById: actorId,
        version: { increment: 1 },
      },
    });
  }

  async testPrompt(id: string, variables: Record<string, unknown>) {
    const template = await this.prisma.promptTemplate.findUnique({ where: { id } });
    const rendered = this.prompts.render(template?.template ?? '', variables);
    return this.provider.generateText({
      prompt: rendered,
      fallback: 'Prompt test output in mock mode.',
    });
  }

  async settings() {
    const settings = await this.prisma.aISetting.findMany({ orderBy: { key: 'asc' } });
    return {
      provider: this.provider.name,
      model: this.provider.model,
      settings,
      defaults: {
        toolsEnabled: true,
        dailyCostLimitUsd: 5,
        perUserDailyCostLimitUsd: 1,
      },
    };
  }

  async updateSettings(input: Record<string, unknown>) {
    const entries = Object.entries(input);
    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.aISetting.upsert({
          where: { key },
          update: { value: value as object },
          create: { key, value: value as object },
        }),
      ),
    );
    return this.settings();
  }

  private async extractAndStoreContext(userId: string, message: string, profile: unknown) {
    const heuristic = this.heuristicMemoryExtraction(message);
    if (!this.shouldExtractMemory(message) && !this.hasMemoryUpdate(heuristic)) {
      return this.emptyMemoryExtraction();
    }

    const prompt = `Trích xuất thông tin bền vững về học viên để cá nhân hóa MentorMind.
Chỉ ghi nhớ thông tin người dùng nói rõ về chính họ. Không suy đoán. Không lưu thông tin nhạy cảm không liên quan học tập/nghề nghiệp.

Profile hiện tại: ${JSON.stringify(profile ?? {})}
Tin nhắn mới: ${message}

Trả về JSON đúng dạng:
{
  "shouldRemember": true,
  "profileUpdates": {
    "targetRole": "Frontend Intern hoặc null",
    "currentLevel": "Junior/Fresher/Foundation hoặc null",
    "goals": "mục tiêu học/nghề nghiệp hoặc null",
    "weeklyHours": 10,
    "learningStyle": "cách học phù hợp hoặc null",
    "budgetRange": "ngân sách/gói học hoặc null",
    "expectedSalary": "mức lương kỳ vọng hoặc null",
    "preferredLocation": "địa điểm ưu tiên hoặc null",
    "timezone": "múi giờ hoặc null",
    "bio": "ghi chú ngắn về người học hoặc null"
  },
  "personalContext": {
    "expectedSalary": "chuỗi nếu có",
    "preferredLocation": "chuỗi nếu có",
    "workMode": "remote/hybrid/onsite nếu có",
    "availability": "lịch rảnh nếu có",
    "constraints": ["ràng buộc quan trọng"],
    "interests": ["mối quan tâm học tập/nghề nghiệp"],
    "notes": ["sự thật ngắn, bền vững"]
  },
  "rememberedFacts": [{"label":"Mức lương kỳ vọng","value":"20 triệu/tháng"}]
}`;

    let extracted = heuristic;
    try {
      const result = await this.provider.generateJson({
        prompt,
        schema: memoryExtractionSchema,
        fallback: heuristic,
      });
      await this.usage.log({
        userId,
        feature: 'LEARNING_ASSISTANT_CONTEXT',
        provider: this.provider,
        usage: result.usage,
        status: AIUsageStatus.SUCCESS,
        latencyMs: result.latencyMs,
      });
      extracted = this.mergeMemoryExtraction(heuristic, this.parseMemoryExtraction(result.data));
    } catch (error) {
      const safe = await this.mockProvider.generateJson({
        prompt,
        schema: memoryExtractionSchema,
        fallback: heuristic,
      });
      await this.usage.log({
        userId,
        feature: 'LEARNING_ASSISTANT_CONTEXT',
        provider: this.mockProvider,
        usage: safe.usage,
        status: AIUsageStatus.FALLBACK,
        errorMessage: error instanceof Error ? error.message : String(error),
        latencyMs: safe.latencyMs,
      });
      extracted = this.parseMemoryExtraction(safe.data);
    }

    const normalized = this.normalizeMemoryExtraction(extracted);
    if (this.hasMemoryUpdate(normalized)) {
      await this.applyMemoryExtraction(userId, normalized);
    }
    return normalized;
  }

  private shouldExtractMemory(message: string) {
    const text = message.toLowerCase();
    return [
      'lương',
      'salary',
      'thu nhập',
      'địa điểm',
      'location',
      'ở ',
      'tại ',
      'remote',
      'hybrid',
      'onsite',
      'mục tiêu',
      'vai trò',
      'target role',
      'trình độ',
      'level',
      'ngân sách',
      'budget',
      'giờ/tuần',
      'giờ mỗi tuần',
      'múi giờ',
      'timezone',
      'phong cách học',
      'cách học',
      'rảnh',
      'available',
    ].some((keyword) => text.includes(keyword));
  }

  private heuristicMemoryExtraction(message: string): MemoryExtraction {
    const profileUpdates: MemoryExtraction['profileUpdates'] = {};
    const personalContext: Record<string, unknown> = {};
    const rememberedFacts: Array<{ label: string; value: string }> = [];

    const salary = this.matchFirst(message, [
      /(?:mức lương|lương|salary|thu nhập)(?:\s*(?:mong muốn|kỳ vọng|expected|là|khoảng|:))?\s*([0-9][^,\n.]{0,48}(?:triệu|tr|m|k|usd|vnd|đ|\/tháng|mỗi tháng)?)/i,
      /([0-9]{1,3}\s*(?:triệu|tr|m|k|usd|vnd|đ)(?:\s*\/\s*tháng)?)/i,
    ]);
    if (salary) {
      profileUpdates.expectedSalary = salary;
      personalContext.expectedSalary = salary;
      rememberedFacts.push({ label: 'Mức lương kỳ vọng', value: salary });
    }

    const location = this.matchFirst(message, [
      /(?:địa điểm|location|sống ở|đang ở|ở|tại|muốn làm ở|làm việc tại|ưu tiên ở)\s+([A-Za-zÀ-ỹ\s]{2,40})(?=[,.!?\n]|$)/i,
    ]);
    if (location) {
      profileUpdates.preferredLocation = location;
      personalContext.preferredLocation = location;
      rememberedFacts.push({ label: 'Địa điểm ưu tiên', value: location });
    }

    const weeklyHoursText = this.matchFirst(message, [
      /([0-9]{1,2})\s*(?:giờ|h)\s*(?:\/|mỗi)?\s*(?:tuần|week)/i,
      /(?:học được|rảnh|available)\s*([0-9]{1,2})\s*(?:giờ|h)/i,
    ]);
    if (weeklyHoursText) {
      const weeklyHours = Number(weeklyHoursText.match(/\d+/)?.[0]);
      if (weeklyHours > 0) {
        profileUpdates.weeklyHours = weeklyHours;
        personalContext.weeklyHours = weeklyHours;
        rememberedFacts.push({ label: 'Thời gian học mỗi tuần', value: `${weeklyHours} giờ/tuần` });
      }
    }

    const role = this.matchFirst(message, [
      /(?:vai trò mục tiêu|target role|muốn làm|ứng tuyển|vị trí)\s*(?:là|:)?\s*([A-Za-zÀ-ỹ0-9\s/+-]{2,48})(?=[,.!?\n]|$)/i,
    ]);
    if (role) {
      profileUpdates.targetRole = role;
      rememberedFacts.push({ label: 'Vai trò mục tiêu', value: role });
    }

    const budget = this.matchFirst(message, [
      /(?:ngân sách|budget)\s*(?:là|khoảng|:)?\s*([0-9][^,\n.]{0,48}(?:triệu|tr|usd|vnd|đ)?)/i,
    ]);
    if (budget) {
      profileUpdates.budgetRange = budget;
      personalContext.budgetRange = budget;
      rememberedFacts.push({ label: 'Ngân sách', value: budget });
    }

    const workMode = this.matchFirst(message, [/\b(remote|hybrid|onsite|online|offline)\b/i]);
    if (workMode) {
      personalContext.workMode = workMode;
      rememberedFacts.push({ label: 'Hình thức ưu tiên', value: workMode });
    }

    return this.parseMemoryExtraction({
      shouldRemember: rememberedFacts.length > 0,
      profileUpdates,
      personalContext,
      rememberedFacts,
    });
  }

  private async applyMemoryExtraction(userId: string, extraction: MemoryExtraction) {
    const current = await this.prisma.studentProfile.findUnique({ where: { userId } });
    const existingContext = this.asRecord(current?.personalContext);
    const profileUpdates = this.cleanProfileUpdates(extraction.profileUpdates);
    const personalContext = this.mergePersonalContext(existingContext, extraction.personalContext);
    const updateData: Prisma.StudentProfileUncheckedUpdateInput = { ...profileUpdates };
    if (Object.keys(personalContext).length) {
      updateData.personalContext = personalContext as Prisma.InputJsonObject;
    }

    const createData: Prisma.StudentProfileUncheckedCreateInput = { userId, ...profileUpdates };
    if (Object.keys(personalContext).length) {
      createData.personalContext = personalContext as Prisma.InputJsonObject;
    }

    await this.prisma.studentProfile.upsert({
      where: { userId },
      create: createData,
      update: updateData,
    });
  }

  private cleanProfileUpdates(profileUpdates: Record<string, unknown>): ProfileMemoryUpdates {
    const allowedKeys = new Set([
      'targetRole',
      'currentLevel',
      'goals',
      'weeklyHours',
      'learningStyle',
      'budgetRange',
      'expectedSalary',
      'preferredLocation',
      'timezone',
      'bio',
    ]);
    const output: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(profileUpdates)) {
      if (!allowedKeys.has(key)) {
        continue;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          output[key] = trimmed;
        }
      } else if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        output[key] = Math.round(value);
      }
    }
    return output as ProfileMemoryUpdates;
  }

  private normalizeMemoryExtraction(extraction: MemoryExtraction): MemoryExtraction {
    const profileUpdates = this.cleanProfileUpdates(extraction.profileUpdates);
    const personalContext = this.cleanJsonRecord(extraction.personalContext);
    if (profileUpdates.expectedSalary && !personalContext.expectedSalary) {
      personalContext.expectedSalary = profileUpdates.expectedSalary;
    }
    if (profileUpdates.preferredLocation && !personalContext.preferredLocation) {
      personalContext.preferredLocation = profileUpdates.preferredLocation;
    }

    const generatedFacts = this.factsFromProfileUpdates(profileUpdates);
    const rememberedFacts = [...extraction.rememberedFacts, ...generatedFacts]
      .map((fact) => ({ label: fact.label.trim(), value: fact.value.trim() }))
      .filter((fact) => fact.label && fact.value)
      .filter(
        (fact, index, all) =>
          all.findIndex((item) => item.label === fact.label && item.value === fact.value) === index,
      )
      .slice(0, 8);

    return this.parseMemoryExtraction({
      shouldRemember:
        extraction.shouldRemember ||
        Object.keys(profileUpdates).length > 0 ||
        Object.keys(personalContext).length > 0,
      profileUpdates,
      personalContext,
      rememberedFacts,
    });
  }

  private mergeMemoryExtraction(base: MemoryExtraction, next: MemoryExtraction): MemoryExtraction {
    return this.parseMemoryExtraction({
      shouldRemember: base.shouldRemember || next.shouldRemember,
      profileUpdates: { ...base.profileUpdates, ...next.profileUpdates },
      personalContext: this.mergePersonalContext(base.personalContext, next.personalContext),
      rememberedFacts: [...base.rememberedFacts, ...next.rememberedFacts],
    });
  }

  private mergePersonalContext(
    existing: Record<string, unknown>,
    incoming: Record<string, unknown>,
  ) {
    const cleanIncoming = this.cleanJsonRecord(incoming);
    const merged: Record<string, unknown> = { ...existing };
    for (const [key, value] of Object.entries(cleanIncoming)) {
      const current = merged[key];
      if (Array.isArray(current) && Array.isArray(value)) {
        merged[key] = Array.from(
          new Set([...current, ...value].map((item) => String(item)).filter(Boolean)),
        );
      } else if (this.isRecord(current) && this.isRecord(value)) {
        merged[key] = this.mergePersonalContext(current, value);
      } else {
        merged[key] = value;
      }
    }
    return this.cleanJsonRecord(merged);
  }

  private cleanJsonRecord(input: Record<string, unknown>) {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      const clean = this.cleanJsonValue(value);
      if (clean !== undefined) {
        output[key] = clean;
      }
    }
    return output;
  }

  private cleanJsonValue(value: unknown): unknown {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      const clean = value
        .map((item) => this.cleanJsonValue(item))
        .filter((item) => item !== undefined);
      return clean.length ? clean : undefined;
    }
    if (this.isRecord(value)) {
      const clean = this.cleanJsonRecord(value);
      return Object.keys(clean).length ? clean : undefined;
    }
    return undefined;
  }

  private factsFromProfileUpdates(profileUpdates: ProfileMemoryUpdates) {
    const labels: Record<string, string> = {
      targetRole: 'Vai trò mục tiêu',
      currentLevel: 'Trình độ hiện tại',
      goals: 'Mục tiêu',
      weeklyHours: 'Thời gian học mỗi tuần',
      learningStyle: 'Cách học phù hợp',
      budgetRange: 'Ngân sách',
      expectedSalary: 'Mức lương kỳ vọng',
      preferredLocation: 'Địa điểm ưu tiên',
      timezone: 'Múi giờ',
      bio: 'Ghi chú cá nhân',
    };
    return Object.entries(profileUpdates)
      .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
      .map(([key, value]) => ({
        label: labels[key] ?? key,
        value: key === 'weeklyHours' ? `${value} giờ/tuần` : String(value),
      }));
  }

  private hasMemoryUpdate(extraction: MemoryExtraction) {
    return (
      Object.keys(this.cleanProfileUpdates(extraction.profileUpdates)).length > 0 ||
      Object.keys(this.cleanJsonRecord(extraction.personalContext)).length > 0
    );
  }

  private emptyMemoryExtraction(): MemoryExtraction {
    return { shouldRemember: false, profileUpdates: {}, personalContext: {}, rememberedFacts: [] };
  }

  private parseMemoryExtraction(input: unknown): MemoryExtraction {
    const parsed = memoryExtractionSchema.parse(input);
    const rememberedFacts = (parsed.rememberedFacts ?? [])
      .map((fact) => ({
        label: String(fact.label ?? '').trim(),
        value: String(fact.value ?? '').trim(),
      }))
      .filter((fact) => fact.label && fact.value);

    return {
      shouldRemember: Boolean(parsed.shouldRemember),
      profileUpdates: this.cleanProfileUpdates(
        (parsed.profileUpdates ?? {}) as Record<string, unknown>,
      ),
      personalContext: this.cleanJsonRecord(
        (parsed.personalContext ?? {}) as Record<string, unknown>,
      ),
      rememberedFacts,
    };
  }

  private formatConversationHistory(messages: AIMessage[]) {
    return messages
      .slice()
      .reverse()
      .map((message) => {
        const role =
          message.role === 'USER'
            ? 'Học viên'
            : message.role === 'ASSISTANT'
              ? 'Trợ lý'
              : 'Hệ thống';
        return `${role}: ${message.content.slice(0, 900)}`;
      })
      .join('\n');
  }

  private matchFirst(text: string, patterns: RegExp[]) {
    for (const pattern of patterns) {
      const match = text.match(pattern)?.[1]?.trim();
      if (match) {
        return match.replace(/\s+/g, ' ');
      }
    }
    return undefined;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return this.isRecord(value) ? value : {};
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  private stringifyForPrompt(value: unknown, maxLength = 14_000) {
    try {
      const json = JSON.stringify(value ?? {});
      return json.length > maxLength ? `${json.slice(0, maxLength)}...` : json;
    } catch {
      return '{}';
    }
  }

  private toJsonValue(value: unknown): Prisma.InputJsonValue {
    try {
      return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
    } catch {
      return { unavailable: true } as Prisma.InputJsonValue;
    }
  }

  private async runJson<T>(
    feature: string,
    promptKey: string,
    variables: Record<string, unknown>,
    schema: z.ZodSchema<T>,
    fallback: T,
    userId?: string,
  ): Promise<T> {
    await this.ensureFeatureAllowed(feature, userId);
    const template = await this.prompts.getActiveTemplate(promptKey);
    const prompt = `${this.prompts.render(template, variables)}

Yêu cầu ngôn ngữ: trả lời bằng Tiếng Việt tự nhiên. Nếu output là JSON, mọi chuỗi trong JSON phải là Tiếng Việt, giữ nguyên key theo schema.`;

    try {
      const result = await this.provider.generateJson({ prompt, schema, fallback });
      await this.usage.log({
        userId,
        feature,
        provider: this.provider,
        usage: result.usage,
        status: AIUsageStatus.SUCCESS,
        latencyMs: result.latencyMs,
      });
      return result.data;
    } catch (error) {
      try {
        const retry = await this.provider.generateJson({
          prompt: `${prompt}\n\nPhản hồi trước không đúng định dạng. Chỉ trả về JSON hợp lệ đúng schema, không thêm markdown.`,
          schema,
          fallback,
        });
        await this.usage.log({
          userId,
          feature,
          provider: this.provider,
          usage: retry.usage,
          status: AIUsageStatus.SUCCESS,
          latencyMs: retry.latencyMs,
        });
        return retry.data;
      } catch (retryError) {
        const safe = await this.mockProvider.generateJson({ prompt, schema, fallback });
        await this.usage.log({
          userId,
          feature,
          provider: this.mockProvider,
          usage: safe.usage,
          status: AIUsageStatus.FALLBACK,
          errorMessage: retryError instanceof Error ? retryError.message : String(error),
          latencyMs: safe.latencyMs,
        });
        return safe.data;
      }
    }
  }

  private async ensureFeatureAllowed(feature: string, userId?: string) {
    const setting = await this.prisma.aISetting.findUnique({
      where: { key: `${feature}:enabled` },
    });
    if (setting?.value === false) {
      throw new ForbiddenException(`${feature} đang bị tạm tắt bởi quản trị viên.`);
    }
    if (!userId) {
      return;
    }
    if (feature === 'LEARNING_ASSISTANT') {
      await this.entitlements.ensureAiChatAllowed(userId);
      return;
    }
    await this.entitlements.ensureAiToolAllowed(userId, feature);
  }

  private async loadStudentContext(userId: string) {
    const [profile, roadmap, submissions, interviews] = await this.prisma.$transaction([
      this.prisma.studentProfile.findUnique({ where: { userId } }),
      this.prisma.roadmap.findFirst({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.codeSubmission.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.interviewSession.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);
    return {
      profile,
      activeRoadmap: roadmap,
      recentSubmissions: submissions,
      recentInterviews: interviews,
    };
  }

  private fallbackRoadmap(input: Record<string, unknown>): RoadmapDraft {
    const role = String(input.targetRole ?? 'Software Developer');
    const goal = String(input.goal ?? `Sẵn sàng ứng tuyển vị trí ${role}`);
    const weekThemes = [
      'Củng cố nền tảng',
      'Thực hành có hướng dẫn',
      'Xây dựng tính năng chính',
      'Hoàn thiện dự án',
      'Chuẩn bị phỏng vấn',
      'Rà soát hồ sơ ứng tuyển',
    ];
    return {
      title: `Lộ trình ${role} cá nhân hóa 1-1`,
      summary: `Lộ trình được mentor rà soát, tập trung vào mục tiêu ${goal}, luyện tập hằng tuần, dự án portfolio và kỹ năng phỏng vấn.`,
      targetOutcome: `Tự tin ứng tuyển vị trí ${role} với portfolio đã được góp ý và các câu trả lời phỏng vấn đã luyện tập.`,
      durationWeeks: 12,
      level: String(input.currentLevel ?? 'FOUNDATION'),
      weeklyPlan: Array.from({ length: 6 }, (_, index) => ({
        weekNumber: index + 1,
        title: weekThemes[index] ?? 'Thực hành theo mục tiêu',
        objectives: [
          'Làm rõ các khái niệm trọng tâm',
          'Luyện tập có chủ đích',
          'Rà soát kết quả cùng mentor',
        ],
        topics: ['Kiến thức nền tảng', 'Kiến trúc dự án', 'Debug và giao tiếp kỹ thuật'],
        practiceTasks: [
          'Giải 3 bài code tập trung đúng chủ đề',
          'Viết ghi chú ngắn về phần đã học',
        ],
        projectTasks: ['Hoàn thiện một phần portfolio và cập nhật README'],
        interviewTasks: ['Trả lời 2 câu hỏi theo vị trí mục tiêu và xem lại phản hồi'],
        recommendedSessionCount: 2,
      })),
      milestones: [
        'Kiểm tra nền tảng',
        'Review portfolio',
        'Phỏng vấn thử',
        'Chốt kế hoạch ứng tuyển',
      ],
      recommendedSessions: 12,
      recommendedAiTools: [
        'Trợ lý học tập AI',
        'Phỏng vấn AI',
        'Review code bằng AI',
        'Tìm tài nguyên học tập',
      ],
      practiceSchedule: [
        '3 buổi luyện code mỗi tuần',
        '1 buổi làm dự án mỗi tuần',
        '1 lần tổng kết kiến thức mỗi tuần',
      ],
      interviewPrepSchedule: [
        'Luyện bộ câu hỏi phỏng vấn hằng tuần',
        'Phỏng vấn thử với mentor mỗi 2 tuần',
      ],
      projectSuggestions: [
        'Dự án portfolio sát vị trí mục tiêu',
        'Tính năng tích hợp API thực tế',
        'Bổ sung kiểm thử và triển khai production',
      ],
      recommendedResources: [
        {
          title: 'MDN JavaScript Guide',
          type: 'DOCUMENTATION',
          reason: 'Tài liệu tham khảo đáng tin cậy cho kiến thức web nền tảng.',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        },
      ],
      risks: [
        'Cần điều chỉnh tiến độ nếu thời gian học mỗi tuần giảm',
        'Phạm vi portfolio cần được giữ vừa sức và đúng mục tiêu',
      ],
    };
  }
}
