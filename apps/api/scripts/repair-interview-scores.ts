import { InterviewSessionStatus, Prisma, PrismaClient } from '@prisma/client';
import { normalizeInterviewEvaluation } from '../src/ai/interview-evaluation.policy';
import { interviewEvaluationSchema } from '../src/ai/schemas/interview.schema';

const prisma = new PrismaClient();

async function main() {
  const answers = await prisma.interviewAnswer.findMany({
    select: {
      id: true,
      answer: true,
      score: true,
      feedback: true,
      betterAnswer: true,
    },
  });
  let repaired = 0;
  let skipped = 0;

  for (const answer of answers) {
    const parsedFeedback = interviewEvaluationSchema.safeParse(answer.feedback);
    if (!parsedFeedback.success) {
      skipped += 1;
      continue;
    }

    const normalized = normalizeInterviewEvaluation(answer.answer, parsedFeedback.data);
    const feedbackChanged = JSON.stringify(normalized) !== JSON.stringify(parsedFeedback.data);
    if (
      !feedbackChanged &&
      answer.score === normalized.score &&
      answer.betterAnswer === normalized.betterAnswer
    ) {
      continue;
    }

    await prisma.interviewAnswer.update({
      where: { id: answer.id },
      data: {
        score: normalized.score,
        feedback: normalized as Prisma.InputJsonValue,
        betterAnswer: normalized.betterAnswer,
      },
    });
    repaired += 1;
  }

  const scoredSessions = await prisma.interviewSession.findMany({
    where: {
      OR: [{ status: InterviewSessionStatus.COMPLETED }, { overallScore: { not: null } }],
    },
    select: {
      id: true,
      overallScore: true,
      answers: { select: { score: true } },
    },
  });
  let sessionsRecalculated = 0;

  for (const session of scoredSessions) {
    const overallScore = session.answers.length
      ? Math.round(
          session.answers.reduce((total, current) => total + current.score, 0) /
            session.answers.length,
        )
      : 0;
    if (session.overallScore === overallScore) {
      continue;
    }

    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { overallScore },
    });
    sessionsRecalculated += 1;
  }

  console.log(
    `Interview score repair completed: ${repaired} answer(s) updated, ${sessionsRecalculated} session score(s) recalculated, ${skipped} invalid legacy feedback record(s) skipped.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
