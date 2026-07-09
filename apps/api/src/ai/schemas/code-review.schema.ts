import { z } from 'zod';

export const codingHintSchema = z.object({
  hintLevel: z.number().int().min(1).max(4),
  hint: z.string(),
  revealsSolution: z.boolean(),
  nextAction: z.string(),
});

export const codeReviewSchema = z.object({
  summary: z.string(),
  correctness: z.string(),
  edgeCases: z.array(z.string()),
  readability: z.array(z.string()),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
  }),
  improvements: z.array(z.string()),
  finalAdvice: z.string(),
});

export type CodeReview = z.infer<typeof codeReviewSchema>;
