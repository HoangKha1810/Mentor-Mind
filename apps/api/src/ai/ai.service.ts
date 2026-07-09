import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { AIUsageStatus, PromptTemplate } from '@prisma/client';
import { z } from 'zod';
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

@Injectable()
export class AiService {
  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    private readonly mockProvider: MockAIProvider,
    private readonly prompts: PromptTemplateService,
    private readonly usage: AIUsageService,
    private readonly prisma: PrismaService,
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
        strengths: ['Clear intent', 'Relevant technical vocabulary'],
        weaknesses: ['Add a concrete example', 'State trade-offs more explicitly'],
        betterAnswer:
          'A stronger answer would define the concept, explain why it matters, then connect it to a project example and trade-offs.',
        nextPracticeSuggestion: 'Practice answering with Situation, Action, Result and one technical detail.',
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
        summary: 'The code is readable enough for a first pass, but verify edge cases before submitting.',
        correctness: 'Likely correct for simple samples if input parsing matches the problem format.',
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
        strengths: ['Clear project ownership', 'Relevant technical stack'],
        weaknesses: ['Impact metrics are vague', 'Missing role-specific keywords'],
        missingKeywords: ['testing', 'performance', 'accessibility', 'deployment'],
        projectSuggestions: ['Add one production-style project with auth, database, and tests'],
        betterBulletPoints: [
          'Built a React dashboard with role-based views, reducing manual tracking time by 30%.',
        ],
        interviewRiskAreas: ['System design trade-offs', 'Explaining business impact'],
        recommendedTutoringPackage: 'CV + Portfolio Career Coaching',
        recommendedRoadmapItems: ['Rewrite project bullets', 'Add deployment notes', 'Mock interview'],
      },
      userId,
    );
  }

  async chat(userId: string, message: string, conversationId?: string) {
    await this.ensureFeatureAllowed('LEARNING_ASSISTANT', userId);
    const context = await this.loadStudentContext(userId);
    const template = await this.prompts.getActiveTemplate('LEARNING_ASSISTANT');
    const prompt = this.prompts.render(template, { message, context });
    const result = await this.provider.generateText({
      prompt,
      fallback:
        'Based on your current context, focus on one measurable next step this week and bring unclear blockers to your mentor session.',
    });
    await this.usage.log({
      userId,
      feature: 'LEARNING_ASSISTANT',
      provider: this.provider,
      usage: result.usage,
      status: AIUsageStatus.SUCCESS,
      latencyMs: result.latencyMs,
    });

    const conversation =
      conversationId
        ? await this.prisma.aIConversation.findUnique({ where: { id: conversationId } })
        : null;
    const thread =
      conversation ??
      (await this.prisma.aIConversation.create({
        data: { userId, title: message.slice(0, 80), type: 'GENERAL' },
      }));

    await this.prisma.aIMessage.createMany({
      data: [
        { conversationId: thread.id, role: 'USER', content: message, metadata: {} },
        { conversationId: thread.id, role: 'ASSISTANT', content: result.data, metadata: { context } },
      ],
    });
    return { conversationId: thread.id, message: result.data };
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
    return this.provider.generateText({ prompt: rendered, fallback: 'Prompt test output in mock mode.' });
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
    const prompt = this.prompts.render(template, variables);

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
          prompt: `${prompt}\n\nYour previous response was invalid. Return JSON matching the schema exactly.`,
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
    const setting = await this.prisma.aISetting.findUnique({ where: { key: `${feature}:enabled` } });
    if (setting?.value === false) {
      throw new ForbiddenException(`${feature} is disabled by admin`);
    }
    if (!userId) {
      return;
    }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const usage = await this.prisma.aIUsageLog.aggregate({
      where: { userId, createdAt: { gte: since } },
      _sum: { estimatedCost: true },
    });
    const total = Number(usage._sum.estimatedCost ?? 0);
    if (total > 1) {
      throw new ForbiddenException('Daily AI usage limit reached');
    }
  }

  private async loadStudentContext(userId: string) {
    const [profile, roadmap, submissions, interviews] = await this.prisma.$transaction([
      this.prisma.studentProfile.findUnique({ where: { userId } }),
      this.prisma.roadmap.findFirst({ where: { studentId: userId }, orderBy: { createdAt: 'desc' } }),
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
    return { profile, activeRoadmap: roadmap, recentSubmissions: submissions, recentInterviews: interviews };
  }

  private fallbackRoadmap(input: Record<string, unknown>): RoadmapDraft {
    const role = String(input.targetRole ?? 'Software Developer');
    const goal = String(input.goal ?? `Become job-ready for ${role}`);
    return {
      title: `${role} Personalized 1-on-1 Roadmap`,
      summary: `A mentor-reviewed plan focused on ${goal}, weekly practice, portfolio output and interview readiness.`,
      targetOutcome: `Confidently apply for ${role} roles with a reviewed portfolio and practiced interview stories.`,
      durationWeeks: 12,
      level: String(input.currentLevel ?? 'FOUNDATION'),
      weeklyPlan: Array.from({ length: 6 }, (_, index) => ({
        weekNumber: index + 1,
        title: `Week ${index + 1}: ${index < 2 ? 'Foundation' : index < 4 ? 'Build' : 'Interview polish'}`,
        objectives: ['Clarify concepts', 'Practice deliberately', 'Review with mentor'],
        topics: ['Core fundamentals', 'Project architecture', 'Debugging and communication'],
        practiceTasks: ['Solve 3 focused coding problems', 'Write a short learning reflection'],
        projectTasks: ['Ship one portfolio increment with README notes'],
        interviewTasks: ['Answer two role-specific questions and review feedback'],
        recommendedSessionCount: 2,
      })),
      milestones: ['Foundation check', 'Portfolio review', 'Mock interview', 'Final action plan'],
      recommendedSessions: 12,
      recommendedAiTools: ['AI Learning Assistant', 'AI Interview', 'AI Code Review', 'Resource Search'],
      practiceSchedule: ['3 coding sessions/week', '1 project block/week', '1 reflection/week'],
      interviewPrepSchedule: ['Weekly mock question set', 'Bi-weekly mentor mock interview'],
      projectSuggestions: ['Role-focused portfolio project', 'API integration feature', 'Testing and deployment pass'],
      recommendedResources: [
        {
          title: 'MDN JavaScript Guide',
          type: 'DOCUMENTATION',
          reason: 'Reliable reference for web fundamentals.',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        },
      ],
      risks: ['Timeline may need adjustment if weekly hours drop', 'Portfolio scope should stay focused'],
    };
  }
}
