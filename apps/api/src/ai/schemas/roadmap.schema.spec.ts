import { roadmapDraftSchema } from './roadmap.schema';

describe('roadmapDraftSchema', () => {
  it('validates a structured roadmap draft', () => {
    const parsed = roadmapDraftSchema.parse({
      title: 'Frontend Roadmap',
      summary: 'A practical plan',
      targetOutcome: 'Job ready',
      durationWeeks: 6,
      level: 'FOUNDATION',
      weeklyPlan: [
        {
          weekNumber: 1,
          title: 'Foundation',
          objectives: ['Learn'],
          topics: ['JS'],
          practiceTasks: ['Solve problems'],
          projectTasks: ['Build UI'],
          interviewTasks: ['Explain state'],
          recommendedSessionCount: 2,
        },
      ],
      milestones: ['Portfolio'],
      recommendedSessions: 6,
      recommendedAiTools: ['AI Interview'],
      practiceSchedule: ['3x/week'],
      interviewPrepSchedule: ['weekly'],
      projectSuggestions: ['Dashboard'],
      recommendedResources: [{ title: 'MDN', type: 'DOCUMENTATION', reason: 'Accurate' }],
      risks: ['Scope creep'],
    });

    expect(parsed.weeklyPlan[0]?.weekNumber).toBe(1);
  });
});
