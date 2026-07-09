import { Prisma, PrismaClient } from '@prisma/client';
import { catalogCodeProblems } from './catalog/code-problems';

const prisma = new PrismaClient();

async function main() {
  let problemCount = 0;

  for (const { testCases, ...problem } of catalogCodeProblems) {
    const upserted = await prisma.codeProblem.upsert({
      where: { slug: problem.slug },
      create: {
        ...problem,
        tags: problem.tags as Prisma.InputJsonValue,
        examples: problem.examples as Prisma.InputJsonValue,
        starterCode: problem.starterCode as Prisma.InputJsonValue,
      },
      update: {
        title: problem.title,
        difficulty: problem.difficulty,
        category: problem.category,
        tags: problem.tags as Prisma.InputJsonValue,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraintsText: problem.constraintsText,
        examples: problem.examples as Prisma.InputJsonValue,
        starterCode: problem.starterCode as Prisma.InputJsonValue,
        solutionExplanation: problem.solutionExplanation,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
        status: problem.status,
      },
    });

    await prisma.codeTestCase.deleteMany({ where: { problemId: upserted.id } });
    await prisma.codeTestCase.createMany({
      data: testCases.map((testCase) => ({
        ...testCase,
        problemId: upserted.id,
      })),
    });
    problemCount += 1;
  }

  console.log(`Catalog seed completed: ${problemCount} code problems upserted.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
