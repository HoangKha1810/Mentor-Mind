export const appName = 'MentorMind AI';

export const roles = ['STUDENT', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'] as const;
export type Role = (typeof roles)[number];

export const packageCategories = [
  'FRONTEND',
  'BACKEND',
  'FULLSTACK',
  'AI_ML',
  'DATA',
  'MOBILE',
  'CAREER',
  'ENGLISH_INTERVIEW',
  'OTHER',
] as const;

export type PackageCategory = (typeof packageCategories)[number];

export const packageLevels = [
  'BEGINNER',
  'FOUNDATION',
  'INTERMEDIATE',
  'ADVANCED',
  'JOB_READY',
] as const;

export type PackageLevel = (typeof packageLevels)[number];

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type RoadmapWeekDto = {
  weekNumber: number;
  title: string;
  objectives: string[];
  topics: string[];
  practiceTasks: string[];
  projectTasks: string[];
  interviewTasks: string[];
  recommendedSessionCount: number;
};

export type RoadmapDraftDto = {
  title: string;
  summary: string;
  targetOutcome: string;
  durationWeeks: number;
  level: string;
  weeklyPlan: RoadmapWeekDto[];
  milestones: string[];
  recommendedSessions: number;
  recommendedAiTools: string[];
  practiceSchedule: string[];
  interviewPrepSchedule: string[];
  projectSuggestions: string[];
  recommendedResources: Array<{
    title: string;
    type: string;
    reason: string;
    url?: string;
  }>;
  risks: string[];
};

export type PublicTutoringPackage = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  category: PackageCategory;
  targetRole: string;
  level: PackageLevel;
  durationWeeks: number;
  recommendedSessions: number;
  price: number;
  currency: string;
  featured: boolean;
  skills: string[];
  includedAiTools: string[];
};

export const featuredPackageSeeds: PublicTutoringPackage[] = [
  {
    id: 'frontend-intern',
    title: 'Frontend Intern 1-on-1 Roadmap',
    slug: 'frontend-intern-1-on-1-roadmap',
    shortDescription: 'From HTML/CSS/JS basics to React portfolio and internship interview readiness.',
    category: 'FRONTEND',
    targetRole: 'Frontend Intern',
    level: 'FOUNDATION',
    durationWeeks: 12,
    recommendedSessions: 24,
    price: 699,
    currency: 'USD',
    featured: true,
    skills: ['JavaScript', 'React', 'CSS', 'Git', 'Portfolio'],
    includedAiTools: ['AI Roadmap', 'Coding Practice', 'AI Interview', 'CV Review'],
  },
  {
    id: 'backend-foundation',
    title: 'Backend Foundation 1-on-1 Roadmap',
    slug: 'backend-foundation-1-on-1-roadmap',
    shortDescription: 'Build production API foundations with Node.js, SQL, auth, testing and deployment.',
    category: 'BACKEND',
    targetRole: 'Backend Developer',
    level: 'FOUNDATION',
    durationWeeks: 14,
    recommendedSessions: 28,
    price: 799,
    currency: 'USD',
    featured: true,
    skills: ['Node.js', 'PostgreSQL', 'REST', 'Auth', 'Testing'],
    includedAiTools: ['AI Roadmap', 'Code Review', 'Resource Search'],
  },
  {
    id: 'coding-interview',
    title: 'Coding Interview Bootcamp',
    slug: 'coding-interview-bootcamp',
    shortDescription: 'Structured practice, mock interviews, feedback loops and job-ready problem solving.',
    category: 'CAREER',
    targetRole: 'Software Engineer',
    level: 'JOB_READY',
    durationWeeks: 8,
    recommendedSessions: 16,
    price: 899,
    currency: 'USD',
    featured: true,
    skills: ['Algorithms', 'Data Structures', 'Communication', 'Debugging'],
    includedAiTools: ['AI Interview', 'Coding Practice', 'AI Hints', 'AI Code Review'],
  },
];

export const codingLanguageOptions = [
  { label: 'JavaScript', value: 'JAVASCRIPT', judge0Id: 63 },
  { label: 'TypeScript', value: 'TYPESCRIPT', judge0Id: 74 },
  { label: 'Python', value: 'PYTHON', judge0Id: 71 },
  { label: 'Java', value: 'JAVA', judge0Id: 62 },
  { label: 'C++', value: 'CPP', judge0Id: 54 },
] as const;

export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
