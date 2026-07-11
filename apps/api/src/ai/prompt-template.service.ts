import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const builtinPromptTemplates = [
  {
    key: 'ROADMAP_GENERATION',
    name: 'Roadmap Generation',
    description: 'Create realistic 1-on-1 tutoring roadmap as strict JSON.',
    template:
      'Bạn là chuyên gia tư vấn học tập và mentor senior. Hãy tạo lộ trình học 1-1 thực tế cho vị trí {{targetRole}}. Trình độ hiện tại: {{currentLevel}}. Mục tiêu: {{goal}}. Thời gian mỗi tuần: {{weeklyHours}} giờ. Điểm yếu: {{weakAreas}}. Không hứa hẹn quá mức. Bao gồm kế hoạch từng tuần, buổi mentor, luyện code, luyện phỏng vấn, tài nguyên và rủi ro. Chỉ trả về JSON đúng schema, toàn bộ nội dung chuỗi bằng Tiếng Việt.',
  },
  {
    key: 'INTERVIEW_ANSWER_EVALUATION',
    name: 'Interview Answer Evaluation',
    description: 'Evaluate interview answer by rubric.',
    template:
      'Đánh giá nghiêm khắc câu trả lời phỏng vấn {{mode}} cho vị trí {{targetRole}}, level {{level}}. Chỉ ghi nhận nội dung có bằng chứng trong câu trả lời, không suy diễn điểm mạnh. Một lời chào hoặc câu không trả lời đúng trọng tâm phải nhận 1/10. Câu hỏi: {{question}}. Câu trả lời: {{answer}}. Ngữ cảnh tham chiếu: {{referenceContext}}. Chấm riêng correctness, clarity, structure, depth, relevance, confidence, examples, communication và roleFit. Trả về JSON only, toàn bộ nội dung chuỗi bằng Tiếng Việt.',
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
      'Bạn là trợ lý học tập AI của MentorMind. Ngữ cảnh học viên: {{context}}. Lịch sử gần nhất: {{history}}. Thông tin vừa ghi nhớ: {{contextUpdates}}. Tin nhắn mới: {{message}}. Trả lời bằng Tiếng Việt, ngắn gọn, thực tế, có bước tiếp theo rõ ràng.',
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
