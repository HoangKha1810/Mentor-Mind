export const siteUrl = 'https://mentormind.center';
export const siteName = 'MentorMind';

export const coreSeoKeywords = [
  'học lập trình online',
  'học lập trình 1 kèm 1',
  'mentor lập trình 1-1',
  'lộ trình học lập trình',
  'lộ trình học AI cá nhân hóa',
  'luyện code online',
  'luyện phỏng vấn IT',
  'phỏng vấn AI',
  'sửa CV IT',
  'sửa CV ATS',
  'học frontend',
  'học backend',
  'học fullstack',
  'học data analyst',
  'học AI machine learning',
  'tài nguyên học lập trình',
];

export const seoLandingPages = [
  {
    slug: 'hoc-lap-trinh-online',
    eyebrow: 'Học lập trình online',
    title: 'Học lập trình online có mentor, AI và lộ trình rõ ràng',
    description:
      'MentorMind giúp học viên học lập trình online theo mục tiêu nghề nghiệp với mentor 1-1, bài tập thực hành, luyện code và phản hồi tiến độ.',
    keywords: [
      'học lập trình online',
      'học lập trình từ đầu',
      'học lập trình cho người mới',
      'học lập trình đi làm',
      'khóa học lập trình online',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo lộ trình học',
    sections: [
      'Lộ trình được cá nhân hóa theo trình độ, mục tiêu, thời gian rảnh và điểm yếu hiện tại.',
      'Mentor theo sát tiến độ, giao bài tập và review theo từng mốc thay vì học video bị bỏ giữa chừng.',
      'AI hỗ trợ luyện code, luyện phỏng vấn, tìm tài nguyên và ghi nhớ ngữ cảnh học tập của bạn.',
    ],
    faq: [
      {
        question: 'MentorMind phù hợp với người mới học lập trình không?',
        answer:
          'Có. Hệ thống có thể bắt đầu từ nền tảng, sau đó tăng dần sang dự án, luyện code, CV và phỏng vấn.',
      },
      {
        question: 'Học online có mentor khác gì tự học?',
        answer:
          'Bạn có lịch học, bài tập, phản hồi và người kiểm tra tiến độ, nên giảm tình trạng học lan man hoặc bỏ cuộc.',
      },
    ],
  },
  {
    slug: 'mentor-lap-trinh-1-1',
    eyebrow: 'Mentor lập trình 1-1',
    title: 'Mentor lập trình 1-1 cho mục tiêu intern, fresher và junior',
    description:
      'Chọn gói mentor 1-1 để học frontend, backend, fullstack, AI/Data hoặc chuẩn bị phỏng vấn theo mục tiêu nghề nghiệp.',
    keywords: [
      'mentor lập trình',
      'mentor 1-1',
      'học lập trình 1 kèm 1',
      'gia sư lập trình',
      'mentor frontend',
      'mentor backend',
    ],
    primaryHref: '/packages',
    primaryLabel: 'Xem gói mentor',
    sections: [
      'Gói học có thời lượng, số buổi, đầu ra và mức giá rõ ràng để dễ chọn theo ngân sách.',
      'Mentor giúp review dự án, sửa hướng học và chuẩn bị câu chuyện phỏng vấn thực tế.',
      'Admin có thể duyệt, chỉnh và publish gói học để nội dung luôn khớp nhu cầu tuyển dụng.',
    ],
    faq: [
      {
        question: 'Mentor 1-1 có giúp làm portfolio không?',
        answer:
          'Có. Lộ trình có thể bao gồm dự án portfolio, review code, cải thiện README, CV và câu trả lời phỏng vấn.',
      },
      {
        question: 'Có thể học theo lịch cá nhân không?',
        answer:
          'Có. Khi tạo lộ trình, bạn nhập thời gian rảnh và MentorMind dùng thông tin đó để đề xuất kế hoạch phù hợp.',
      },
    ],
  },
  {
    slug: 'lo-trinh-hoc-ai-ca-nhan-hoa',
    eyebrow: 'Lộ trình học AI',
    title: 'Lộ trình học AI cá nhân hóa theo mục tiêu nghề nghiệp',
    description:
      'Tạo lộ trình học AI, lập trình, data hoặc interview prep dựa trên level hiện tại, CV, mục tiêu và thời gian học mỗi tuần.',
    keywords: [
      'lộ trình học AI',
      'lộ trình học lập trình',
      'AI tạo lộ trình học',
      'học AI cho người mới',
      'kế hoạch học lập trình',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo roadmap bằng AI',
    sections: [
      'AI tạo bản nháp roadmap theo mục tiêu, nhưng admin/mentor vẫn có thể duyệt để tránh kế hoạch quá ảo.',
      'Roadmap chia theo tuần, gồm chủ đề, bài luyện, dự án, phỏng vấn và tài nguyên.',
      'Trợ lý học tập dùng dữ liệu CV, phỏng vấn, code và tiến độ để gợi ý bước tiếp theo.',
    ],
    faq: [
      {
        question: 'Roadmap AI có được người thật duyệt không?',
        answer:
          'Có. MentorMind thiết kế quy trình để admin hoặc mentor duyệt lộ trình trước khi học viên triển khai nghiêm túc.',
      },
      {
        question: 'Có thể tạo lộ trình theo CV hiện tại không?',
        answer:
          'Có. Bạn có thể upload CV/JD để AI hiểu điểm mạnh, keyword thiếu và rủi ro phỏng vấn.',
      },
    ],
  },
  {
    slug: 'luyen-code-online',
    eyebrow: 'Luyện code online',
    title: 'Luyện code online với test tự động và gợi ý AI',
    description:
      'Luyện bài code trực tiếp trên trình duyệt, chạy test an toàn, lưu lịch sử bài nộp và nhận gợi ý khi bị kẹt.',
    keywords: [
      'luyện code online',
      'luyện thuật toán',
      'bài tập lập trình',
      'luyện phỏng vấn thuật toán',
      'AI gợi ý code',
    ],
    primaryHref: '/code-practice',
    primaryLabel: 'Mở bài luyện code',
    sections: [
      'Bài luyện có đề, ví dụ, ràng buộc, starter code, test case và lời giải thích.',
      'Hệ thống lưu submission, verdict, runtime và trạng thái để theo dõi tiến bộ.',
      'Trợ lý AI có thể đọc ngữ cảnh bài hiện tại và đưa hint nhẹ thay vì bật mí lời giải ngay.',
    ],
    faq: [
      {
        question: 'Có thể luyện code cho phỏng vấn fresher không?',
        answer:
          'Có. Bạn có thể luyện từ easy đến hard, kết hợp review cách giải và luyện diễn đạt khi phỏng vấn.',
      },
      {
        question: 'AI có viết hộ lời giải không?',
        answer:
          'Mục tiêu là gợi ý đúng mức để bạn tự tiến bộ; bạn có thể yêu cầu hint nhẹ, phân tích lỗi hoặc giải thích hướng làm.',
      },
    ],
  },
  {
    slug: 'luyen-phong-van-ai',
    eyebrow: 'Luyện phỏng vấn AI',
    title: 'Luyện phỏng vấn AI cho IT, HR, tiếng Anh và bảo vệ dự án',
    description:
      'Tạo phiên phỏng vấn AI theo vai trò mục tiêu, nhận điểm rubric, feedback và câu trả lời tốt hơn sau từng câu.',
    keywords: [
      'luyện phỏng vấn AI',
      'luyện phỏng vấn IT',
      'mock interview',
      'phỏng vấn frontend',
      'phỏng vấn backend',
      'phỏng vấn tiếng Anh IT',
    ],
    primaryHref: '/ai-interview',
    primaryLabel: 'Luyện phỏng vấn',
    sections: [
      'Câu hỏi theo role, level và mode: technical, behavioral, HR, project defense hoặc English.',
      'AI chấm điểm, chỉ ra điểm yếu và gợi ý cách trả lời tự nhiên hơn.',
      'Kết quả phỏng vấn được nối với CV và roadmap để gợi ý phần cần luyện tiếp.',
    ],
    faq: [
      {
        question: 'Có luyện được phỏng vấn tiếng Anh không?',
        answer:
          'Có. MentorMind có mode English để luyện cách trình bày kinh nghiệm và dự án bằng tiếng Anh.',
      },
      {
        question: 'Có lưu lịch sử phỏng vấn không?',
        answer:
          'Có. Tài khoản học viên lưu session, câu trả lời, điểm và feedback để theo dõi tiến bộ.',
      },
    ],
  },
  {
    slug: 'sua-cv-ats-it',
    eyebrow: 'Sửa CV ATS IT',
    title: 'Sửa CV ATS cho ứng viên IT bằng AI và mentor review',
    description:
      'Upload CV/JD để AI phân tích keyword thiếu, bullet point, điểm yếu phỏng vấn và đề xuất lộ trình cải thiện hồ sơ.',
    keywords: [
      'sửa CV ATS',
      'sửa CV IT',
      'review CV lập trình viên',
      'CV frontend',
      'CV backend',
      'CV fresher IT',
    ],
    primaryHref: '/dashboard/cv-review',
    primaryLabel: 'Review CV',
    sections: [
      'AI phân tích CV theo target role, JD, portfolio và GitHub để đưa gợi ý cụ thể.',
      'Kết quả gồm điểm tổng quan, điểm mạnh, điểm yếu, keyword thiếu và rủi ro khi phỏng vấn.',
      'Dữ liệu CV được dùng để cá nhân hóa roadmap, tài nguyên và câu hỏi luyện phỏng vấn.',
    ],
    faq: [
      {
        question: 'ATS keyword là gì?',
        answer:
          'Đó là các từ khóa kỹ năng, công nghệ, vai trò hoặc kinh nghiệm mà hệ thống lọc CV và nhà tuyển dụng thường tìm.',
      },
      {
        question: 'Có cần JD để review CV không?',
        answer:
          'Không bắt buộc, nhưng có JD sẽ giúp AI so sánh CV với yêu cầu công việc chính xác hơn.',
      },
    ],
  },
] as const;

export type SeoLandingPage = (typeof seoLandingPages)[number];
