export type StudentProfile = {
  targetRole?: string | null;
  currentLevel?: string | null;
  goals?: string | null;
  weeklyHours?: number | null;
  learningStyle?: string | null;
  budgetRange?: string | null;
  expectedSalary?: string | null;
  preferredLocation?: string | null;
  timezone?: string | null;
  bio?: string | null;
  personalContext?: Record<string, unknown> | null;
};

export type Account = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
  status: string;
  lastLoginAt?: string | null;
  studentProfile?: StudentProfile | null;
  mentorProfile?: Record<string, unknown> | null;
  adminProfile?: Record<string, unknown> | null;
};

export type RoadmapRequest = {
  id: string;
  goal: string;
  targetRole: string;
  currentLevel: string;
  status: string;
  weeklyHours: number;
  preferredSchedule: string;
  budgetRange: string;
  learningStyle: string;
  wantsInterviewPrep: boolean;
  wantsCodePractice: boolean;
  aiDraftRoadmapId?: string | null;
  finalRoadmapId?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type RoadmapWeek = {
  id: string;
  weekNumber: number;
  title: string;
  objectives?: unknown;
  topics?: unknown;
  practiceTasks?: unknown;
  projectTasks?: unknown;
  interviewTasks?: unknown;
};

export type RoadmapDetail = {
  request: RoadmapRequest;
  aiDraft?: {
    id: string;
    title: string;
    summary: string;
    targetOutcome: string;
    durationWeeks: number;
    status: string;
    weeks?: RoadmapWeek[];
    items?: Array<{ id: string; title: string; description: string; status: string; order: number }>;
  } | null;
  finalRoadmap?: RoadmapDetail['aiDraft'];
};

export type Booking = {
  id: string;
  mentorId: string;
  studentId: string;
  roadmapId?: string | null;
  packageId?: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
  meetingUrl?: string | null;
  studentNote?: string | null;
  mentorNote?: string | null;
  adminNote?: string | null;
  createdAt: string;
  student?: { id: string; fullName: string; email: string; avatarUrl?: string | null } | null;
  mentor?: { id: string; fullName: string; email: string; avatarUrl?: string | null } | null;
};

export type Mentor = {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  mentorProfile?: {
    headline?: string;
    bio?: string;
    rating?: number;
    yearsExperience?: number;
    skills?: unknown;
  } | null;
};

export type CodeProblem = {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags?: unknown;
  statement?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraintsText?: string;
  examples?: unknown;
  starterCode?: Record<string, string>;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  testCases?: Array<{ id: string; input: string; expectedOutput: string; order: number }>;
};

export type CodeSubmission = {
  id: string;
  language: string;
  verdict: string;
  runtimeMs?: number | null;
  memoryKb?: number | null;
  passedTests: number;
  totalTests: number;
  errorMessage?: string | null;
  createdAt: string;
  problem?: {
    title: string;
    slug: string;
    difficulty: string;
  };
};

export type InterviewSession = {
  id: string;
  targetRole: string;
  level: string;
  mode: string;
  status: string;
  overallScore?: number | null;
  feedback?: unknown;
  createdAt: string;
  completedAt?: string | null;
  answers?: InterviewAnswer[];
};

export type InterviewAnswer = {
  id: string;
  question: string;
  answer: string;
  score: number;
  feedback?: unknown;
  betterAnswer?: string;
  createdAt: string;
};

export type InterviewQuestion = {
  id: string;
  question: string;
  role: string;
  category: string;
  level: string;
  expectedPoints?: unknown;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  metadata?: unknown;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
};

export type ResourceItem = {
  id?: string;
  title: string;
  source: string;
  author?: string;
  type: string;
  url?: string;
  description: string;
  difficulty: string;
  category?: string;
  tags?: string[];
  estimatedMinutes?: number;
  whyRecommended?: string;
  isExternal?: boolean;
};

export type CvReview = {
  id: string;
  targetRole?: string;
  cvAssetId?: string | null;
  jdAssetId?: string | null;
  overallScore: number;
  result: unknown;
  createdAt: string;
};

export type FileAsset = {
  id: string;
  ownerId: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
};

export type AiContextUpdate = {
  shouldRemember: boolean;
  profileUpdates: Partial<StudentProfile>;
  personalContext: Record<string, unknown>;
  rememberedFacts: Array<{ label: string; value: string }>;
};

export type AiMessage = {
  id?: string;
  conversationId?: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: {
    contextUpdates?: AiContextUpdate;
    [key: string]: unknown;
  };
  createdAt?: string;
  pending?: boolean;
};

export type AiConversation = {
  id: string;
  userId: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
};

export type AiChatResponse = {
  conversationId: string;
  message: string;
  contextUpdates: AiContextUpdate;
};

export type PackageItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  targetRole: string;
  level: string;
  category: string;
  durationWeeks: number;
  recommendedSessions: number;
  sessionDurationMinutes: number;
  outcomes?: unknown;
  skills?: unknown;
  includedAiTools?: unknown;
  mentorType: string;
  price: string | number;
  currency: string;
};
