import {
  BookOpen,
  Bot,
  BrainCircuit,
  Code2,
  FileCheck2,
  MessagesSquare,
  Users,
} from 'lucide-react';

export const publicFeatures = [
  {
    title: 'Lộ trình AI',
    href: '/create-roadmap',
    description:
      'Tạo kế hoạch học theo mục tiêu, trình độ và thời gian rảnh, sau đó được đội ngũ chuyên môn duyệt lại trước khi triển khai.',
    icon: BrainCircuit,
  },
  {
    title: 'Mentor 1-1',
    href: '/packages',
    description:
      'Mỗi học viên có lịch học, bài tập, ghi chú buổi học và phản hồi tiến độ được quản lý tập trung.',
    icon: Users,
  },
  {
    title: 'Phỏng vấn AI',
    href: '/ai-interview',
    description:
      'Luyện kỹ thuật, hành vi, HR, tiếng Anh và bảo vệ dự án với rubric rõ ràng sau từng câu trả lời.',
    icon: MessagesSquare,
  },
  {
    title: 'Luyện code',
    href: '/code-practice',
    description:
      'Viết code trực tiếp trên trình duyệt, chạy test an toàn bằng Judge0 và nhận gợi ý khi bị kẹt.',
    icon: Code2,
  },
  {
    title: 'Tìm tài nguyên',
    href: '/resources',
    description:
      'Kết hợp tài nguyên nội bộ với Tavily để gợi ý sách, docs, bài viết và dự án sát với lộ trình.',
    icon: BookOpen,
  },
  {
    title: 'Sửa CV',
    href: '/dashboard/cv-review',
    description:
      'Phân tích CV, JD và portfolio để đề xuất keyword, bullet point và kế hoạch cải thiện hồ sơ.',
    icon: FileCheck2,
  },
  {
    title: 'Trợ lý học tập',
    href: '/dashboard/ai-assistant',
    description:
      'Hỏi đáp theo lộ trình, bài nộp, tài nguyên và mục tiêu học tập đã lưu trên tài khoản.',
    icon: Bot,
  },
];
