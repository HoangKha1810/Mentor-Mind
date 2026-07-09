import { featuredPackageSeeds } from '@mentormind/shared';
import {
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarCheck,
  Code2,
  FileCheck2,
  GraduationCap,
  Headphones,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export const packages = featuredPackageSeeds;

export const publicFeatures = [
  {
    title: 'AI Roadmap',
    description: 'Structured JSON roadmap drafts reviewed by admin or mentor before becoming a real plan.',
    icon: BrainCircuit,
  },
  {
    title: '1-on-1 Mentoring',
    description: 'Consultation, assigned mentors, sessions, homework, notes and feedback loops.',
    icon: Users,
  },
  {
    title: 'AI Interview',
    description: 'Technical, behavioral, HR, English and project-defense practice with rubric scoring.',
    icon: MessagesSquare,
  },
  {
    title: 'Coding Practice',
    description: 'Monaco editor, public/hidden tests, safe judge provider, AI hints and code review.',
    icon: Code2,
  },
  {
    title: 'Resource Search',
    description: 'Curated books, docs, articles, projects and external enrichment with reasons.',
    icon: BookOpen,
  },
  {
    title: 'CV Review',
    description: 'Portfolio fit score, missing keywords, improved bullets and roadmap suggestions.',
    icon: FileCheck2,
  },
];

export const dashboardStats = [
  { label: 'Roadmap progress', value: '64%', icon: GraduationCap, tone: 'cyan' },
  { label: 'Upcoming sessions', value: '3', icon: CalendarCheck, tone: 'violet' },
  { label: 'Solved problems', value: '42', icon: Code2, tone: 'emerald' },
  { label: 'Interview avg', value: '7.8', icon: BarChart3, tone: 'amber' },
] as const;

export const adminStats = [
  { label: 'Pending roadmaps', value: '18', icon: BrainCircuit, tone: 'cyan' },
  { label: 'Active mentors', value: '24', icon: Headphones, tone: 'violet' },
  { label: 'AI cost today', value: '$18.42', icon: Sparkles, tone: 'amber' },
  { label: 'Security events', value: '0', icon: ShieldCheck, tone: 'emerald' },
] as const;

export const roadmapWeeks = [
  'Clarify target role and fundamentals gap',
  'Core concepts and deliberate practice',
  'Portfolio project architecture',
  'API integration, testing and deployment',
  'Interview question loops and debugging drills',
  'Final mentor review and job application plan',
];

export const codingProblems = [
  { title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY', category: 'Arrays', solved: true },
  { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'EASY', category: 'Stack', solved: false },
  { title: 'Binary Search', slug: 'binary-search', difficulty: 'EASY', category: 'Search', solved: true },
  { title: 'Simple LRU Cache', slug: 'simple-lru-cache', difficulty: 'MEDIUM', category: 'Design', solved: false },
];

export const resources = [
  'Eloquent JavaScript',
  'MDN JavaScript Guide',
  'React Documentation',
  'System Design Primer',
  'SQLBolt',
  'PostgreSQL Docs',
];
