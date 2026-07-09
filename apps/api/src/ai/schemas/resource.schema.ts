import { z } from 'zod';

export const resourceRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string(),
      source: z.string(),
      type: z.string(),
      url: z.string().url().optional(),
      difficulty: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      whyRecommended: z.string(),
      isExternal: z.boolean(),
    }),
  ),
});

export type ResourceRecommendation = z.infer<typeof resourceRecommendationSchema>;
