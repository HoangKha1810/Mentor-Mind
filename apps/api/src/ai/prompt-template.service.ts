import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const builtinPromptTemplates = [
  {
    key: 'ROADMAP_GENERATION',
    name: 'Roadmap Generation',
    description: 'Create realistic 1-on-1 tutoring roadmap as strict JSON.',
    template:
      'Act as a senior learning consultant and mentor. Create a realistic 1-on-1 tutoring roadmap for {{targetRole}}. Current level: {{currentLevel}}. Goal: {{goal}}. Weekly hours: {{weeklyHours}}. Weak areas: {{weakAreas}}. Avoid overpromising. Include weekly plan, mentor sessions, coding practice, interview practice, resources, risks. Output JSON only.',
  },
  {
    key: 'INTERVIEW_ANSWER_EVALUATION',
    name: 'Interview Answer Evaluation',
    description: 'Evaluate interview answer by rubric.',
    template:
      'Đánh giá câu trả lời phỏng vấn {{mode}} cho vị trí {{targetRole}}, level {{level}}. Câu hỏi: {{question}}. Câu trả lời: {{answer}}. Chấm 1-10 cho correctness, clarity, structure, depth, relevance, confidence, examples, communication, roleFit. Trả về JSON only, toàn bộ nội dung chuỗi bằng Tiếng Việt.',
  },
  {
    key: 'INTERVIEW_QUESTION_GENERATION',
    name: 'Interview Question Generation',
    description: 'Generate JD-specific interview questions.',
    template:
      'Generate targeted interview questions for role {{targetRole}}, level {{level}}, mode {{mode}}. Job description/context: {{jdText}}. Output JSON only.',
  },
  {
    key: 'CODING_HINT',
    name: 'Coding Hint',
    description: 'Progressive coding hint without revealing full solution early.',
    template:
      'Give hint level {{hintLevel}} for problem {{title}}. Do not reveal full solution unless level 4. Student code: {{code}}. Output JSON only.',
  },
  {
    key: 'CODE_REVIEW',
    name: 'Code Review',
    description: 'Review code correctness, edge cases, complexity and readability.',
    template:
      'Review code for problem {{title}}. Analyze correctness, edge cases, complexity, readability, naming and maintainability. Be direct and respectful. Code: {{code}}. Output JSON only.',
  },
  {
    key: 'RESOURCE_RECOMMENDATION',
    name: 'Resource Recommendation',
    description: 'Recommend books, docs, articles, projects and platform resources.',
    template:
      'Recommend resources for query {{query}}. Student level: {{level}}. Goal: {{goal}}. Match resources to user needs and explain why. Output JSON only.',
  },
  {
    key: 'CV_REVIEW',
    name: 'CV Review',
    description: 'Review CV/portfolio against target role/JD.',
    template:
      'Phân tích CV/portfolio cho vị trí {{targetRole}}. CV: {{cvText}}. JD: {{jdText}}. Portfolio: {{portfolioUrl}}. GitHub: {{githubUrl}}. Chấm điểm, chỉ ra keyword thiếu, bullet nên viết lại, cải thiện dự án, rủi ro khi phỏng vấn và đề xuất lộ trình/gói học. Trả về JSON only, toàn bộ nội dung chuỗi bằng Tiếng Việt.',
  },
  {
    key: 'LEARNING_ASSISTANT',
    name: 'Learning Assistant',
    description: 'Context-aware learning assistant for students.',
    template:
      'You are a context-aware learning assistant. User context: {{context}}. User message: {{message}}. If platform data is missing, say what is missing. Be concise and actionable.',
  },
  {
    key: 'WEEKLY_REPORT',
    name: 'Weekly Report',
    description: 'Generate weekly learning insight.',
    template:
      'Create a concise weekly learning insight from progress: {{progress}}. Include wins, risks, and next action. Output JSON only.',
  },
];

@Injectable()
export class PromptTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveTemplate(key: string) {
    const fromDb = await this.prisma.promptTemplate.findFirst({ where: { key, isActive: true } });
    if (fromDb) {
      return fromDb.template;
    }
    return builtinPromptTemplates.find((item) => item.key === key)?.template ?? '{{input}}';
  }

  render(template: string, variables: Record<string, unknown>) {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      if (key === 'input') {
        return JSON.stringify(variables);
      }
      const value = variables[key];
      if (value === undefined || value === null) {
        return '';
      }
      return typeof value === 'string' ? value : JSON.stringify(value);
    });
  }

  async list() {
    const existing = await this.prisma.promptTemplate.findMany({ orderBy: { key: 'asc' } });
    if (existing.length) {
      return existing;
    }
    return builtinPromptTemplates.map((template) => ({
      id: template.key,
      ...template,
      version: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedById: null,
    }));
  }
}
