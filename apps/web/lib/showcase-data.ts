import { featuredPackages } from '@mentormind/shared';
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

export const packages = featuredPackages;

export const publicFeatures = [
  {
    title: 'Lộ trình AI',
    description:
      'Tạo kế hoạch học theo mục tiêu, trình độ và thời gian rảnh, sau đó được đội ngũ chuyên môn duyệt lại trước khi triển khai.',
    icon: BrainCircuit,
  },
  {
    title: 'Mentor 1-1',
    description:
      'Mỗi học viên có lịch học, bài tập, ghi chú buổi học và phản hồi tiến độ được quản lý tập trung.',
    icon: Users,
  },
  {
    title: 'Phỏng vấn AI',
    description:
      'Luyện kỹ thuật, hành vi, HR, tiếng Anh và bảo vệ dự án với rubric rõ ràng sau từng câu trả lời.',
    icon: MessagesSquare,
  },
  {
    title: 'Luyện code',
    description:
      'Viết code trực tiếp trên trình duyệt, chạy test an toàn bằng Judge0 và nhận gợi ý khi bị kẹt.',
    icon: Code2,
  },
  {
    title: 'Tìm tài nguyên',
    description:
      'Kết hợp tài nguyên nội bộ với Tavily để gợi ý sách, docs, bài viết và dự án sát với lộ trình.',
    icon: BookOpen,
  },
  {
    title: 'Sửa CV',
    description:
      'Phân tích CV, JD và portfolio để đề xuất keyword, bullet point và kế hoạch cải thiện hồ sơ.',
    icon: FileCheck2,
  },
];

export const dashboardStats = [
  { label: 'Tiến độ lộ trình', value: '64%', icon: GraduationCap, tone: 'cyan' },
  { label: 'Buổi học sắp tới', value: '3', icon: CalendarCheck, tone: 'violet' },
  { label: 'Bài code đã giải', value: '42', icon: Code2, tone: 'emerald' },
  { label: 'Điểm phỏng vấn TB', value: '7.8', icon: BarChart3, tone: 'amber' },
] as const;

export const adminStats = [
  { label: 'Lộ trình chờ duyệt', value: '18', icon: BrainCircuit, tone: 'cyan' },
  { label: 'Mentor đang hoạt động', value: '24', icon: Headphones, tone: 'violet' },
  { label: 'Chi phí AI hôm nay', value: '$18.42', icon: Sparkles, tone: 'amber' },
  { label: 'Sự kiện bảo mật', value: '0', icon: ShieldCheck, tone: 'emerald' },
] as const;

export const roadmapWeeks = [
  'Làm rõ mục tiêu nghề nghiệp và lỗ hổng nền tảng',
  'Ôn khái niệm cốt lõi và luyện tập có chủ đích',
  'Thiết kế kiến trúc dự án portfolio',
  'Tích hợp API, testing và triển khai',
  'Vòng luyện câu hỏi phỏng vấn và debug',
  'Mentor đánh giá cuối và kế hoạch ứng tuyển',
];

export const codingProblems = [
  { title: 'Two Sum', slug: 'two-sum', difficulty: 'DỄ', category: 'Mảng', solved: true },
  {
    title: 'Ngoặc hợp lệ',
    slug: 'valid-parentheses',
    difficulty: 'DỄ',
    category: 'Ngăn xếp',
    solved: false,
  },
  {
    title: 'Tìm kiếm nhị phân',
    slug: 'binary-search',
    difficulty: 'DỄ',
    category: 'Tìm kiếm',
    solved: true,
  },
  {
    title: 'LRU Cache đơn giản',
    slug: 'simple-lru-cache',
    difficulty: 'TRUNG BÌNH',
    category: 'Thiết kế',
    solved: false,
  },
];

export const resources = [
  'Eloquent JavaScript',
  'Hướng dẫn JavaScript trên MDN',
  'Tài liệu React',
  'System Design Primer',
  'SQLBolt',
  'Tài liệu PostgreSQL',
];
