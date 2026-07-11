import { z } from 'zod';

export const interviewEvaluationSchema = z.object({
  score: z.number().int().min(1).max(10),
  strengths: z.array(z.string().trim().min(1).max(500)).max(5),
  weaknesses: z.array(z.string().trim().min(1).max(500)).min(1).max(5),
  betterAnswer: z.string().trim().min(1).max(4000),
  nextPracticeSuggestion: z.string().trim().min(1).max(2000),
  rubric: z.object({
    correctness: z.number().min(0).max(10),
    clarity: z.number().min(0).max(10),
    structure: z.number().min(0).max(10),
    depth: z.number().min(0).max(10),
    relevance: z.number().min(0).max(10),
    confidence: z.number().min(0).max(10),
    examples: z.number().min(0).max(10),
    communication: z.number().min(0).max(10),
    roleFit: z.number().min(0).max(10),
  }),
});

export const interviewQuestionGenerationSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      category: z.string(),
      expectedPoints: z.array(z.string()),
    }),
  ),
});

export type InterviewEvaluation = z.infer<typeof interviewEvaluationSchema>;
