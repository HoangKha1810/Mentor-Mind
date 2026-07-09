import { z } from 'zod';

export const roadmapWeekSchema = z.object({
  weekNumber: z.number().int().positive(),
  title: z.string(),
  objectives: z.array(z.string()),
  topics: z.array(z.string()),
  practiceTasks: z.array(z.string()),
  projectTasks: z.array(z.string()),
  interviewTasks: z.array(z.string()),
  recommendedSessionCount: z.number().int().nonnegative(),
});

export const roadmapDraftSchema = z.object({
  title: z.string(),
  summary: z.string(),
  targetOutcome: z.string(),
  durationWeeks: z.number().int().positive(),
  level: z.string(),
  weeklyPlan: z.array(roadmapWeekSchema).min(1),
  milestones: z.array(z.string()),
  recommendedSessions: z.number().int().nonnegative(),
  recommendedAiTools: z.array(z.string()),
  practiceSchedule: z.array(z.string()),
  interviewPrepSchedule: z.array(z.string()),
  projectSuggestions: z.array(z.string()),
  recommendedResources: z.array(
    z.object({
      title: z.string(),
      type: z.string(),
      reason: z.string(),
      url: z.string().url().optional(),
    }),
  ),
  risks: z.array(z.string()),
});

export type RoadmapDraft = z.infer<typeof roadmapDraftSchema>;
