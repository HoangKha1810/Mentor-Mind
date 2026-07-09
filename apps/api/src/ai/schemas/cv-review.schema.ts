import { z } from 'zod';

export const cvReviewSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  projectSuggestions: z.array(z.string()),
  betterBulletPoints: z.array(z.string()),
  interviewRiskAreas: z.array(z.string()),
  recommendedTutoringPackage: z.string(),
  recommendedRoadmapItems: z.array(z.string()),
});

export type CvReviewResult = z.infer<typeof cvReviewSchema>;
