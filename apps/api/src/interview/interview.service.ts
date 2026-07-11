import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InterviewCategory,
  InterviewMode,
  InterviewSessionStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { normalizeInterviewAnswer } from '../ai/interview-evaluation.policy';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

const sessionSchema = z.object({
  targetRole: z.string().min(2),
  level: z.string().min(2),
  mode: z.nativeEnum(InterviewMode),
  sourceJdAssetId: z.string().optional(),
});

const answerSchema = z.object({
  questionId: z.string().cuid().optional(),
  question: z
    .string()
    .max(2000)
    .transform(normalizeInterviewAnswer)
    .refine((value) => value.length >= 5, 'Câu hỏi phải có ít nhất 5 ký tự.'),
  answer: z
    .string()
    .max(12_000)
    .transform(normalizeInterviewAnswer)
    .refine((value) => /[\p{L}\p{N}]/u.test(value), 'Câu trả lời phải có nội dung có nghĩa.'),
});

const questionSchema = z.object({
  role: z.string(),
  category: z.nativeEnum(InterviewCategory),
  level: z.string(),
  question: z.string(),
  expectedPoints: z.array(z.string()).default([]),
  sampleAnswer: z.string().default(''),
  commonMistakes: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

@Injectable()
export class InterviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createSession(studentId: string, input: unknown) {
    const body = sessionSchema.parse(input);
    const session = await this.prisma.interviewSession.create({ data: { ...body, studentId } });
    const questions = await this.prisma.interviewQuestion.findMany({
      where: {
        isActive: true,
        OR: [
          { role: { contains: body.targetRole, mode: 'insensitive' } },
          { category: this.modeToCategory(body.mode) },
        ],
      },
      take: 5,
    });
    return { session, suggestedQuestions: questions };
  }

  async answer(studentId: string, sessionId: string, input: unknown) {
    const body = answerSchema.parse(input);
    const session = await this.prisma.interviewSession.findUnique({ where: { id: sessionId } });
    if (!session || session.studentId !== studentId) {
      throw new NotFoundException('Interview session not found');
    }
    if (session.status !== InterviewSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('Phiên phỏng vấn đã kết thúc, không thể nộp thêm câu trả lời.');
    }
    const referenceQuestion = await this.prisma.interviewQuestion.findFirst({
      where: {
        id: body.questionId,
        question: body.questionId ? undefined : body.question,
        role: { contains: session.targetRole, mode: 'insensitive' },
        level: session.level,
        isActive: true,
      },
      select: {
        question: true,
        expectedPoints: true,
        sampleAnswer: true,
        commonMistakes: true,
      },
    });
    if (body.questionId && !referenceQuestion) {
      throw new BadRequestException('Câu hỏi không thuộc phiên phỏng vấn hiện tại.');
    }
    const question = referenceQuestion?.question ?? body.question;
    const evaluation = await this.ai.evaluateInterviewAnswer(studentId, {
      targetRole: session.targetRole,
      level: session.level,
      mode: session.mode,
      question,
      answer: body.answer,
      referenceContext: referenceQuestion,
    });
    return this.prisma.interviewAnswer.create({
      data: {
        sessionId,
        question,
        answer: body.answer,
        score: evaluation.score,
        feedback: evaluation,
        betterAnswer: evaluation.betterAnswer,
      },
    });
  }

  async finish(studentId: string, sessionId: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: { answers: true },
    });
    if (!session || session.studentId !== studentId) {
      throw new NotFoundException('Interview session not found');
    }
    const overallScore = session.answers.length
      ? Math.round(
          session.answers.reduce((sum, answer) => sum + answer.score, 0) / session.answers.length,
        )
      : 0;
    return this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore,
        feedback: {
          summary:
            'Hãy xem lại các câu có điểm thấp trước, sau đó luyện một câu chuyện ví dụ mạnh hơn.',
          weakAreas: session.answers
            .filter((answer) => answer.score < 7)
            .map((answer) => answer.question),
        },
        completedAt: new Date(),
        status: InterviewSessionStatus.COMPLETED,
      },
      include: { answers: true },
    });
  }

  mySessions(studentId: string) {
    return this.prisma.interviewSession.findMany({
      where: { studentId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async session(user: AuthUser, id: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
      include: { answers: true },
    });
    if (!session) {
      throw new NotFoundException('Interview session not found');
    }
    if (user.role === Role.STUDENT && session.studentId !== user.id) {
      throw new ForbiddenException('You cannot view this interview session');
    }
    return session;
  }

  async generateFromJd(studentId: string, input: unknown) {
    const body = z
      .object({
        targetRole: z.string(),
        level: z.string(),
        mode: z.nativeEnum(InterviewMode).default(InterviewMode.TECHNICAL),
        jdText: z.string().min(10),
      })
      .parse(input);
    return this.ai.generateInterviewQuestions(studentId, body);
  }

  questions(query: Record<string, string | undefined>) {
    const where: Prisma.InterviewQuestionWhereInput = {
      isActive: query.includeInactive === 'true' ? undefined : true,
      role: query.role ? { contains: query.role, mode: 'insensitive' } : undefined,
      category: query.category as never,
      level: query.level,
    };
    return this.prisma.interviewQuestion.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  createQuestion(input: unknown) {
    const body = questionSchema.parse(input);
    return this.prisma.interviewQuestion.create({ data: body });
  }

  updateQuestion(id: string, input: unknown) {
    const body = questionSchema.partial().parse(input);
    return this.prisma.interviewQuestion.update({ where: { id }, data: body });
  }

  deleteQuestion(id: string) {
    return this.prisma.interviewQuestion.delete({ where: { id } });
  }

  private modeToCategory(mode: InterviewMode): InterviewCategory | undefined {
    if (mode === InterviewMode.BEHAVIORAL) return InterviewCategory.BEHAVIORAL;
    if (mode === InterviewMode.HR) return InterviewCategory.HR;
    if (mode === InterviewMode.PROJECT_DEFENSE) return InterviewCategory.PROJECT_DEFENSE;
    if (mode === InterviewMode.ENGLISH) return InterviewCategory.ENGLISH_INTERVIEW;
    return undefined;
  }
}
