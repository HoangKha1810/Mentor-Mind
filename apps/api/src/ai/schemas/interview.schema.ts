import { z } from 'zod';

export const interviewEvaluationSchema = z.object({
  score: z.number().int().min(1).max(10),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  betterAnswer: z.string(),
  nextPracticeSuggestion: z.string(),
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
