import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const password = 'Password123!';

async function main() {
  await prisma.$transaction([
    prisma.aIMessage.deleteMany(),
    prisma.aIConversation.deleteMany(),
    prisma.codeHintUsage.deleteMany(),
    prisma.codeSubmission.deleteMany(),
    prisma.codeTestCase.deleteMany(),
    prisma.codeProblem.deleteMany(),
    prisma.interviewAnswer.deleteMany(),
    prisma.interviewSession.deleteMany(),
    prisma.interviewQuestion.deleteMany(),
    prisma.homeworkSubmission.deleteMany(),
    prisma.homework.deleteMany(),
    prisma.sessionNote.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.mentorAvailability.deleteMany(),
    prisma.roadmapItem.deleteMany(),
    prisma.roadmapWeek.deleteMany(),
    prisma.roadmap.deleteMany(),
    prisma.roadmapRequest.deleteMany(),
    prisma.packageConsultationRequest.deleteMany(),
    prisma.tutoringPackage.deleteMany(),
    prisma.resourceEmbedding.deleteMany(),
    prisma.contentEmbedding.deleteMany(),
    prisma.resourceSearchLog.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.cvReview.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.supportTicket.deleteMany(),
    prisma.fileAsset.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.promptTemplate.deleteMany(),
    prisma.aIUsageLog.deleteMany(),
    prisma.aISetting.deleteMany(),
    prisma.studentProfile.deleteMany(),
    prisma.mentorProfile.deleteMany(),
    prisma.adminProfile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await argon2.hash(password);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mentormind.ai',
      passwordHash,
      fullName: 'Ava Nguyen',
      role: 'ADMIN',
      adminProfile: { create: { department: 'Learning Operations', notes: 'Seed admin' } },
    },
  });
  const mentorFrontend = await prisma.user.create({
    data: {
      email: 'mentor.frontend@mentormind.ai',
      passwordHash,
      fullName: 'Linh Tran',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          headline: 'Senior Frontend Mentor',
          bio: 'Helps early-career developers build job-ready React portfolios.',
          skills: ['React', 'TypeScript', 'CSS', 'Portfolio Review'],
          categories: ['FRONTEND', 'CAREER'],
          hourlyRate: 45,
          yearsExperience: 8,
          rating: 4.9,
        },
      },
    },
  });
  const mentorAi = await prisma.user.create({
    data: {
      email: 'mentor.ai@mentormind.ai',
      passwordHash,
      fullName: 'Minh Pham',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          headline: 'AI/ML and Data Mentor',
          bio: 'Guides Python, ML foundations, data projects and interview preparation.',
          skills: ['Python', 'Machine Learning', 'SQL', 'Interview Prep'],
          categories: ['AI_ML', 'DATA'],
          hourlyRate: 55,
          yearsExperience: 9,
          rating: 4.8,
        },
      },
    },
  });
  const student = await prisma.user.create({
    data: {
      email: 'student@mentormind.ai',
      passwordHash,
      fullName: 'Jamie Le',
      role: 'STUDENT',
      studentProfile: {
        create: {
          targetRole: 'Frontend Intern',
          currentLevel: 'FOUNDATION',
          goals: 'Become internship-ready with a polished React portfolio.',
          weeklyHours: 10,
          learningStyle: 'Project-based with mentor feedback',
          budgetRange: '$500-$900',
          timezone: 'Asia/Ho_Chi_Minh',
          bio: 'Self-taught student preparing for first tech role.',
        },
      },
    },
  });

  const packageData = [
    ['Frontend Intern 1-on-1 Roadmap', 'frontend-intern-1-on-1-roadmap', 'FRONTEND', 'Frontend Intern', 'FOUNDATION', 12, 24, 699],
    ['Backend Foundation 1-on-1 Roadmap', 'backend-foundation-1-on-1-roadmap', 'BACKEND', 'Backend Developer', 'FOUNDATION', 14, 28, 799],
    ['Fullstack Portfolio Builder', 'fullstack-portfolio-builder', 'FULLSTACK', 'Fullstack Developer', 'INTERMEDIATE', 16, 32, 999],
    ['AI/ML Beginner Mentorship', 'ai-ml-beginner-mentorship', 'AI_ML', 'AI/ML Beginner', 'BEGINNER', 12, 24, 899],
    ['Data Analyst Interview Prep', 'data-analyst-interview-prep', 'DATA', 'Data Analyst', 'JOB_READY', 8, 16, 649],
    ['Coding Interview Bootcamp', 'coding-interview-bootcamp', 'CAREER', 'Software Engineer', 'JOB_READY', 8, 16, 899],
    ['CV + Portfolio Career Coaching', 'cv-portfolio-career-coaching', 'CAREER', 'Junior Developer', 'JOB_READY', 4, 6, 299],
  ] as const;

  const packages = await Promise.all(
    packageData.map(([title, slug, category, targetRole, level, durationWeeks, recommendedSessions, price], index) =>
      prisma.tutoringPackage.create({
        data: {
          title,
          slug,
          shortDescription: `Mentor-led ${targetRole} plan with AI-assisted practice and review.`,
          longDescription:
            'A structured 1-on-1 tutoring package with weekly outcomes, mentor sessions, homework review, coding/interview practice and admin consultation.',
          targetAudience: 'Students who want guided, job-oriented learning rather than passive video courses.',
          targetRole,
          level,
          category,
          durationWeeks,
          recommendedSessions,
          sessionDurationMinutes: 60,
          outcomes: ['Clear weekly plan', 'Reviewed portfolio progress', 'Interview-ready answers'],
          skills: ['Planning', 'Practice', 'Communication', targetRole],
          includedAiTools: ['AI Roadmap', 'AI Interview', 'AI Code Review', 'Resource Search'],
          mentorType: index < 3 ? 'Senior software mentor' : 'Career and technical mentor',
          price,
          currency: 'USD',
          status: 'PUBLISHED',
          featured: index < 3,
          heroConfig: { accent: index % 2 ? 'cyan' : 'violet' },
        },
      }),
    ),
  );

  await prisma.packageConsultationRequest.create({
    data: {
      studentId: student.id,
      packageId: packages[0]!.id,
      message: 'I want to confirm if this plan fits my internship deadline.',
      adminId: admin.id,
      mentorId: mentorFrontend.id,
      status: 'SCHEDULED',
    },
  });

  const roadmapRequest = await prisma.roadmapRequest.create({
    data: {
      studentId: student.id,
      goal: 'Become frontend-intern ready in 12 weeks with a polished React portfolio.',
      targetRole: 'Frontend Intern',
      currentLevel: 'FOUNDATION',
      currentSkills: ['HTML', 'CSS', 'basic JavaScript'],
      weakAreas: ['React state management', 'technical interview communication'],
      weeklyHours: 10,
      preferredSchedule: 'Weekday evenings and Sunday morning',
      budgetRange: '$500-$900',
      learningStyle: 'Project-based with mentor feedback',
      mentorPreference: 'Patient, direct, portfolio-focused',
      wantsInterviewPrep: true,
      wantsCodePractice: true,
      assignedAdminId: admin.id,
      assignedMentorId: mentorFrontend.id,
      status: 'PENDING_ADMIN_REVIEW',
    },
  });

  const roadmap = await prisma.roadmap.create({
    data: {
      studentId: student.id,
      requestId: roadmapRequest.id,
      title: 'Frontend Intern 12-week 1-on-1 Roadmap',
      summary: 'A mentor-reviewed roadmap balancing React fundamentals, portfolio work and interview practice.',
      targetOutcome: 'Apply to frontend internships with a reviewed portfolio and practiced interview answers.',
      durationWeeks: 12,
      level: 'FOUNDATION',
      status: 'APPROVED',
      aiGenerated: true,
      adminApproved: true,
      mentorId: mentorFrontend.id,
      adminId: admin.id,
      risks: ['Scope creep in portfolio', 'Not enough interview repetition'],
      recommendedResources: [{ title: 'React Documentation', reason: 'Primary source for React foundations' }],
      weeks: {
        create: Array.from({ length: 6 }, (_, index) => ({
          weekNumber: index + 1,
          title: `Week ${index + 1}: Frontend focus`,
          objectives: ['Understand concepts', 'Practice with examples', 'Review with mentor'],
          topics: ['React', 'TypeScript', 'CSS architecture'],
          practiceTasks: ['Solve three coding problems', 'Refactor one component'],
          projectTasks: ['Ship one portfolio increment'],
          interviewTasks: ['Answer two frontend questions'],
          recommendedSessionCount: 2,
        })),
      },
      items: {
        create: ['React fundamentals', 'Portfolio landing page', 'Mock interview', 'Final CV pass'].map((title, index) => ({
          type: 'PRACTICE',
          title,
          description: `${title} milestone`,
          order: index + 1,
        })),
      },
    },
  });
  await prisma.roadmapRequest.update({
    where: { id: roadmapRequest.id },
    data: { aiDraftRoadmapId: roadmap.id, finalRoadmapId: roadmap.id, status: 'APPROVED' },
  });

  await prisma.mentorAvailability.createMany({
    data: [
      { mentorId: mentorFrontend.id, dayOfWeek: 1, startTime: '19:00', endTime: '21:00' },
      { mentorId: mentorFrontend.id, dayOfWeek: 3, startTime: '19:00', endTime: '21:00' },
      { mentorId: mentorAi.id, dayOfWeek: 6, startTime: '09:00', endTime: '12:00' },
    ],
  });
  await prisma.booking.create({
    data: {
      studentId: student.id,
      mentorId: mentorFrontend.id,
      roadmapId: roadmap.id,
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      status: 'CONFIRMED',
      meetingUrl: 'https://meet.example.com/mentormind-demo',
      studentNote: 'Please review my React state management understanding.',
    },
  });

  const problems = [
    ['Two Sum', 'two-sum', 'EASY', 'Arrays'],
    ['Valid Parentheses', 'valid-parentheses', 'EASY', 'Stack'],
    ['Palindrome String', 'palindrome-string', 'EASY', 'String'],
    ['FizzBuzz Advanced', 'fizzbuzz-advanced', 'EASY', 'Loops'],
    ['Merge Sorted Arrays', 'merge-sorted-arrays', 'EASY', 'Arrays'],
    ['SQL-like Data Filtering in JS', 'sql-like-data-filtering-in-js', 'MEDIUM', 'Data'],
    ['REST API Response Transformer', 'rest-api-response-transformer', 'MEDIUM', 'Backend'],
    ['Debounce Function', 'debounce-function', 'MEDIUM', 'Frontend'],
    ['Binary Search', 'binary-search', 'EASY', 'Search'],
    ['Simple LRU Cache', 'simple-lru-cache', 'HARD', 'Design'],
  ] as const;

  await Promise.all(
    problems.map(([title, slug, difficulty, category], index) =>
      prisma.codeProblem.create({
        data: {
          title,
          slug,
          difficulty,
          category,
          tags: [category.toLowerCase(), difficulty.toLowerCase()],
          statement: `Solve ${title}. Return the expected output for each input according to the examples.`,
          inputFormat: 'A JSON-compatible input string.',
          outputFormat: 'A string or JSON-compatible output.',
          constraintsText: 'Use an efficient algorithm and avoid mutating input unless documented.',
          examples: [{ input: 'sample', output: 'sample' }],
          starterCode: {
            JAVASCRIPT: 'function solve(input) {\n  return input;\n}',
            PYTHON: 'def solve(input):\n    return input',
            JAVA: 'class Solution { String solve(String input) { return input; } }',
            CPP: '#include <string>\nstd::string solve(std::string input) { return input; }',
          },
          solutionExplanation: 'Admin-only canonical explanation for mentor review.',
          timeLimitMs: 1000 + index * 50,
          memoryLimitMb: 128,
          status: 'PUBLISHED',
          testCases: {
            create: [
              { input: 'sample', expectedOutput: 'sample', isHidden: false, order: 1 },
              { input: 'edge', expectedOutput: 'edge', isHidden: true, order: 2 },
            ],
          },
        },
      }),
    ),
  );

  const questions = [
    ['Frontend Intern', 'FRONTEND', 'FOUNDATION', 'Explain the JavaScript event loop.'],
    ['Frontend Intern', 'FRONTEND', 'FOUNDATION', 'React state vs props: when do you use each?'],
    ['Backend Developer', 'BACKEND', 'FOUNDATION', 'REST vs GraphQL: what are the trade-offs?'],
    ['Data Analyst', 'SQL', 'FOUNDATION', 'Explain SQL JOIN types with examples.'],
    ['Software Engineer', 'SYSTEM_DESIGN', 'INTERMEDIATE', 'Authentication vs authorization: what is the difference?'],
    ['Junior Developer', 'PROJECT_DEFENSE', 'FOUNDATION', 'Explain a project you built and your technical decisions.'],
    ['Junior Developer', 'BEHAVIORAL', 'FOUNDATION', 'Tell me about a time you solved a difficult problem.'],
    ['Junior Developer', 'HR', 'FOUNDATION', 'Why should we hire you?'],
  ] as const;
  await prisma.interviewQuestion.createMany({
    data: questions.map(([role, category, level, question]) => ({
      role,
      category,
      level,
      question,
      expectedPoints: ['Clear definition', 'Concrete example', 'Trade-off awareness'],
      sampleAnswer: 'A strong answer gives the concept, example and practical trade-offs.',
      commonMistakes: ['Too abstract', 'No example', 'No trade-off'],
      tags: [role.toLowerCase(), category.toLowerCase()],
    })),
  });

  const resources = [
    ['Eloquent JavaScript', 'BOOK', 'Marijn Haverbeke', 'https://eloquentjavascript.net/'],
    ['MDN JavaScript Guide', 'DOCUMENTATION', 'MDN', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide'],
    ['React Documentation', 'DOCUMENTATION', 'React Team', 'https://react.dev/learn'],
    ["You Don't Know JS", 'BOOK', 'Kyle Simpson', 'https://github.com/getify/You-Dont-Know-JS'],
    ['System Design Primer', 'ARTICLE', 'donnemartin', 'https://github.com/donnemartin/system-design-primer'],
    ['SQLBolt', 'ARTICLE', 'SQLBolt', 'https://sqlbolt.com/'],
    ['Python Official Tutorial', 'DOCUMENTATION', 'Python', 'https://docs.python.org/3/tutorial/'],
    ['FastAPI Docs', 'DOCUMENTATION', 'FastAPI', 'https://fastapi.tiangolo.com/'],
    ['PostgreSQL Docs', 'DOCUMENTATION', 'PostgreSQL', 'https://www.postgresql.org/docs/'],
    ['Roadmap.sh', 'ARTICLE', 'roadmap.sh', 'https://roadmap.sh/'],
  ] as const;
  await prisma.resource.createMany({
    data: resources.map(([title, type, author, url]) => ({
      title,
      source: author,
      author,
      type,
      url,
      description: `${title} is a high-signal learning resource for job-oriented software learners.`,
      difficulty: title.includes('System') ? 'ADVANCED' : 'BEGINNER',
      category: title.includes('SQL') || title.includes('PostgreSQL') ? 'DATA' : 'FRONTEND',
      tags: title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
      estimatedMinutes: 90,
      whyRecommended: 'Curated because it is accurate, practical and useful alongside mentor feedback.',
      isCurated: true,
      status: 'PUBLISHED',
    })),
  });

  const promptTemplates = [
    'ROADMAP_GENERATION',
    'INTERVIEW_QUESTION_GENERATION',
    'INTERVIEW_ANSWER_EVALUATION',
    'CODING_HINT',
    'CODE_REVIEW',
    'RESOURCE_RECOMMENDATION',
    'CV_REVIEW',
    'LEARNING_ASSISTANT',
    'WEEKLY_REPORT',
  ];
  await prisma.promptTemplate.createMany({
    data: promptTemplates.map((key) => ({
      key,
      name: key
        .toLowerCase()
        .split('_')
        .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
        .join(' '),
      description: `Seeded prompt template for ${key}.`,
      template: `You are MentorMind AI. Execute ${key} using variables: {{input}}. Output JSON only when structured output is required.`,
      version: 1,
      isActive: true,
      updatedById: admin.id,
    })),
  });
  await prisma.aISetting.createMany({
    data: [
      { key: 'toolsEnabled', value: true },
      { key: 'dailyCostLimitUsd', value: 5 },
      { key: 'perUserDailyCostLimitUsd', value: 1 },
    ],
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        type: 'ROADMAP_APPROVED',
        title: 'Roadmap approved',
        message: 'Your frontend roadmap has been reviewed and approved.',
        metadata: { roadmapId: roadmap.id },
      },
      {
        userId: student.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Session confirmed',
        message: 'Your next mentor session is confirmed.',
        metadata: { mentorId: mentorFrontend.id },
      },
    ],
  });
  await prisma.payment.create({
    data: {
      studentId: student.id,
      packageId: packages[0]!.id,
      amount: 699,
      currency: 'USD',
      status: 'PAID',
      provider: 'mock',
      providerRef: 'mock_pi_001',
    },
  });

  console.log('Seed completed');
  console.table([
    ['admin@mentormind.ai', password, 'ADMIN'],
    ['mentor.frontend@mentormind.ai', password, 'MENTOR'],
    ['mentor.ai@mentormind.ai', password, 'MENTOR'],
    ['student@mentormind.ai', password, 'STUDENT'],
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
