import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CodeLanguage, CodeProblemStatus, Prisma, Role } from '@prisma/client';
import { codingLanguageStarterCode, slugify } from '@mentormind/shared';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { PrismaService } from '../prisma/prisma.service';
import { CodeJudgeProvider } from './code-judge.interface';

export const CODE_JUDGE_PROVIDER = Symbol('CODE_JUDGE_PROVIDER');

const codeRunSchema = z.object({
  language: z.nativeEnum(CodeLanguage),
  code: z.string().min(1),
});

const problemSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  statement: z.string(),
  inputFormat: z.string(),
  outputFormat: z.string(),
  constraintsText: z.string(),
  examples: z.array(z.record(z.unknown())).default([]),
  starterCode: z.record(z.string()).default({ ...codingLanguageStarterCode }),
  solutionExplanation: z.string().default('Admin-only explanation'),
  timeLimitMs: z.number().int().positive().default(1000),
  memoryLimitMb: z.number().int().positive().default(128),
  isPremium: z.boolean().default(false),
  unlockPrice: z.number().int().nonnegative().default(0),
  status: z.nativeEnum(CodeProblemStatus).default(CodeProblemStatus.DRAFT),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean().default(false),
        order: z.number().int(),
      }),
    )
    .default([]),
});

@Injectable()
export class CodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly entitlements: EntitlementsService,
    @Inject(CODE_JUDGE_PROVIDER) private readonly judge: CodeJudgeProvider,
  ) {}

  async problems(query: Record<string, string | undefined>) {
    const where: Prisma.CodeProblemWhereInput = {
      status: CodeProblemStatus.PUBLISHED,
      difficulty: query.difficulty as never,
      category: query.category,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: 'insensitive' } },
            { statement: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    return this.prisma.codeProblem.findMany({
      where,
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        tags: true,
        examples: true,
        timeLimitMs: true,
        memoryLimitMb: true,
        isPremium: true,
        unlockPrice: true,
      },
    });
  }

  async problem(slug: string) {
    const problem = await this.prisma.codeProblem.findFirst({
      where: { slug, status: CodeProblemStatus.PUBLISHED },
      include: {
        testCases: {
          where: { isHidden: false },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    return {
      ...problem,
      starterCode: withLanguageStarterFallbacks(problem.starterCode),
      solutionExplanation: undefined,
    };
  }

  async adminProblems(query: Record<string, string | undefined>) {
    const where: Prisma.CodeProblemWhereInput = {
      status: query.status as never,
      difficulty: query.difficulty as never,
      category: query.category,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: 'insensitive' } },
            { statement: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    return this.prisma.codeProblem.findMany({
      where,
      include: { testCases: { orderBy: { order: 'asc' } } },
      orderBy: [{ status: 'asc' }, { difficulty: 'asc' }, { createdAt: 'desc' }],
      take: 200,
    });
  }

  async adminProblem(id: string) {
    const problem = await this.prisma.codeProblem.findUnique({
      where: { id },
      include: { testCases: { orderBy: { order: 'asc' } } },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    return { ...problem, starterCode: withLanguageStarterFallbacks(problem.starterCode) };
  }

  async run(studentId: string, problemId: string, input: unknown, includeHidden: boolean) {
    const body = codeRunSchema.parse(input);
    const problem = await this.prisma.codeProblem.findUnique({
      where: { id: problemId },
      include: { testCases: { orderBy: { order: 'asc' } } },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    const cases = includeHidden
      ? problem.testCases
      : problem.testCases.filter((test) => !test.isHidden);
    if (!cases.length) {
      throw new BadRequestException('Problem has no runnable test cases');
    }
    const access = await this.entitlements.ensureCodeProblemAccess(studentId, problem);
    const result = await this.judge.run({
      language: body.language,
      code: body.code,
      testCases: cases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });
    return { ...result, access };
  }

  async submit(studentId: string, problemId: string, input: unknown) {
    const body = codeRunSchema.parse(input);
    const problem = await this.prisma.codeProblem.findUnique({
      where: { id: problemId },
      include: { testCases: { orderBy: { order: 'asc' } } },
    });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    if (!problem.testCases.length) {
      throw new BadRequestException('Problem has no runnable test cases');
    }
    const access = await this.entitlements.ensureCodeProblemAccess(studentId, problem);
    const result = await this.judge.run({
      language: body.language,
      code: body.code,
      testCases: problem.testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitMb: problem.memoryLimitMb,
    });
    const submission = await this.prisma.codeSubmission.create({
      data: {
        problemId,
        studentId,
        language: body.language,
        code: body.code,
        verdict: result.verdict,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        errorMessage: result.errorMessage,
      },
    });
    return { submission, result: { ...result, publicResults: result.publicResults }, access };
  }

  submissions(studentId: string) {
    return this.prisma.codeSubmission.findMany({
      where: { studentId },
      include: { problem: { select: { title: true, slug: true, difficulty: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submission(user: AuthUser, id: string) {
    const submission = await this.prisma.codeSubmission.findUnique({
      where: { id },
      include: { problem: { select: { title: true, slug: true, difficulty: true } } },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (user.role === Role.STUDENT && submission.studentId !== user.id) {
      throw new ForbiddenException('You cannot view this submission');
    }
    return submission;
  }

  async hint(studentId: string, problemId: string, input: unknown) {
    const problem = await this.prisma.codeProblem.findUnique({ where: { id: problemId } });
    if (!problem) {
      throw new NotFoundException('Problem not found');
    }
    const hintLevel = Math.min(
      Math.max(Number((input as { hintLevel?: number }).hintLevel ?? 1), 1),
      4,
    );
    const hint = await this.ai.codingHint(studentId, {
      hintLevel,
      title: problem.title,
      statement: problem.statement,
      code: (input as { code?: string }).code ?? '',
    });
    await this.prisma.codeHintUsage.create({
      data: { problemId, studentId, hintLevel, hintText: hint.hint },
    });
    return hint;
  }

  async review(studentId: string, submissionId: string) {
    const submission = await this.prisma.codeSubmission.findUnique({
      where: { id: submissionId },
      include: { problem: true },
    });
    if (!submission || submission.studentId !== studentId) {
      throw new NotFoundException('Submission not found');
    }
    const review = await this.ai.codeReview(studentId, {
      title: submission.problem.title,
      statement: submission.problem.statement,
      code: submission.code,
      verdict: submission.verdict,
    });
    return this.prisma.codeSubmission.update({
      where: { id: submissionId },
      data: { aiReview: review },
    });
  }

  async createProblem(input: unknown) {
    const body = problemSchema.parse(input);
    const { testCases, ...problem } = body;
    return this.prisma.codeProblem.create({
      data: {
        ...problem,
        slug: body.slug ?? slugify(body.title),
        tags: body.tags as Prisma.InputJsonValue,
        examples: body.examples as Prisma.InputJsonValue,
        starterCode: body.starterCode as Prisma.InputJsonValue,
        testCases: { create: testCases },
      },
      include: { testCases: true },
    });
  }

  async updateProblem(id: string, input: unknown) {
    const body = problemSchema.partial().parse(input);
    const { testCases, ...problem } = body;
    if (testCases) {
      await this.prisma.codeTestCase.deleteMany({ where: { problemId: id } });
    }
    const data: Prisma.CodeProblemUpdateInput = {
      ...problem,
      slug: body.slug ?? (body.title ? slugify(body.title) : undefined),
      tags: body.tags as Prisma.InputJsonValue | undefined,
      examples: body.examples as Prisma.InputJsonValue | undefined,
      starterCode: body.starterCode as Prisma.InputJsonValue | undefined,
      testCases: testCases ? { create: testCases } : undefined,
    };
    return this.prisma.codeProblem.update({
      where: { id },
      data,
      include: { testCases: true },
    });
  }

  deleteProblem(id: string) {
    return this.prisma.codeProblem.delete({ where: { id } });
  }
}

function withLanguageStarterFallbacks(value: Prisma.JsonValue) {
  const stored =
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.fromEntries(
          Object.entries(value).filter((entry): entry is [string, string] => {
            return typeof entry[1] === 'string';
          }),
        )
      : {};
  return { ...codingLanguageStarterCode, ...stored };
}
