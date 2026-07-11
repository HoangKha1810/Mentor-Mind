import { BadRequestException } from '@nestjs/common';
import { InterviewMode, InterviewSessionStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import type { InterviewEvaluation } from '../ai/schemas/interview.schema';
import { PrismaService } from '../prisma/prisma.service';
import { InterviewService } from './interview.service';

const studentId = 'student-id';
const sessionId = 'session-id';
const questionId = 'clx1234567890abcdefghijkl';

const session = {
  id: sessionId,
  studentId,
  targetRole: 'AI Research Intern',
  level: 'Intern',
  mode: InterviewMode.TECHNICAL,
  status: InterviewSessionStatus.IN_PROGRESS,
};

const evaluation: InterviewEvaluation = {
  score: 8,
  strengths: ['Có số liệu kết quả cụ thể.'],
  weaknesses: ['Cần giải thích rõ hơn cách đo latency.'],
  betterAnswer: 'Tôi đo baseline, tối ưu truy vấn và xác nhận latency giảm bằng tracing.',
  nextPracticeSuggestion: 'Luyện giải thích cách đo trước và sau tối ưu.',
  rubric: {
    correctness: 8,
    clarity: 8,
    structure: 8,
    depth: 7,
    relevance: 9,
    confidence: 8,
    examples: 9,
    communication: 8,
    roleFit: 8,
  },
};

function createSubject() {
  const findSession = jest.fn();
  const findQuestion = jest.fn();
  const createAnswer = jest.fn();
  const evaluateInterviewAnswer = jest.fn();
  const prisma = {
    interviewSession: { findUnique: findSession },
    interviewQuestion: { findFirst: findQuestion },
    interviewAnswer: { create: createAnswer },
  } as unknown as PrismaService;
  const ai = { evaluateInterviewAnswer } as unknown as AiService;

  return {
    service: new InterviewService(prisma, ai),
    findSession,
    findQuestion,
    createAnswer,
    evaluateInterviewAnswer,
  };
}

describe('InterviewService answer', () => {
  it('rejects a completed session before calling AI or creating an answer', async () => {
    const subject = createSubject();
    subject.findSession.mockResolvedValue({
      ...session,
      status: InterviewSessionStatus.COMPLETED,
    });

    await expect(
      subject.service.answer(studentId, sessionId, {
        question: 'Describe an important technical experience.',
        answer: 'I improved an API and measured the result.',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(subject.findQuestion).not.toHaveBeenCalled();
    expect(subject.evaluateInterviewAnswer).not.toHaveBeenCalled();
    expect(subject.createAnswer).not.toHaveBeenCalled();
  });

  it('uses the canonical selected question and reference context and saves a normalized answer', async () => {
    const subject = createSubject();
    const referenceQuestion = {
      question: 'How did you diagnose and improve a slow API endpoint?',
      expectedPoints: ['Baseline measurement', 'Root cause', 'Verified result'],
      sampleAnswer: 'I measured p95 latency, inspected query plans, and verified the improvement.',
      commonMistakes: ['Claiming an improvement without a measurement'],
    };
    const normalizedAnswer = 'I improved latency from 900 ms to 180 ms.';
    const storedAnswer = { id: 'answer-id', sessionId, questionId, score: evaluation.score };
    subject.findSession.mockResolvedValue(session);
    subject.findQuestion.mockResolvedValue(referenceQuestion);
    subject.evaluateInterviewAnswer.mockResolvedValue(evaluation);
    subject.createAnswer.mockResolvedValue(storedAnswer);

    const result = await subject.service.answer(studentId, sessionId, {
      questionId,
      question: 'Client-edited question text must not be trusted.',
      answer: '  I\u200B improved   latency from 900 ms to 180 ms.  ',
    });

    expect(subject.findQuestion).toHaveBeenCalledWith({
      where: {
        id: questionId,
        question: undefined,
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
    expect(subject.evaluateInterviewAnswer).toHaveBeenCalledWith(studentId, {
      targetRole: session.targetRole,
      level: session.level,
      mode: session.mode,
      question: referenceQuestion.question,
      answer: normalizedAnswer,
      referenceContext: referenceQuestion,
    });
    expect(subject.createAnswer).toHaveBeenCalledWith({
      data: {
        sessionId,
        question: referenceQuestion.question,
        answer: normalizedAnswer,
        score: evaluation.score,
        feedback: evaluation,
        betterAnswer: evaluation.betterAnswer,
      },
    });
    expect(result).toBe(storedAnswer);
  });

  it('rejects a questionId that does not belong to the current session selection', async () => {
    const subject = createSubject();
    subject.findSession.mockResolvedValue(session);
    subject.findQuestion.mockResolvedValue(null);

    await expect(
      subject.service.answer(studentId, sessionId, {
        questionId,
        question: 'A question selected by the client.',
        answer: 'I measured the baseline before making any changes.',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(subject.evaluateInterviewAnswer).not.toHaveBeenCalled();
    expect(subject.createAnswer).not.toHaveBeenCalled();
  });
});
