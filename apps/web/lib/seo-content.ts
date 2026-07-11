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
  'học ReactJS online',
  'học NodeJS backend',
  'học data analyst',
  'học AI machine learning',
  'lộ trình học frontend',
  'lộ trình học backend',
  'portfolio lập trình viên',
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
  {
    slug: 'khoa-hoc-lap-trinh-online',
    eyebrow: 'Khóa học lập trình online',
    title: 'Khóa học lập trình online theo mục tiêu đi làm',
    description:
      'Tìm khóa học lập trình online có lộ trình, mentor, bài tập thực chiến, luyện phỏng vấn và review CV cho mục tiêu intern, fresher hoặc junior.',
    keywords: [
      'khóa học lập trình online',
      'khóa học lập trình đi làm',
      'học lập trình online có mentor',
      'khóa học IT online',
      'học lập trình thực chiến',
    ],
    primaryHref: '/packages',
    primaryLabel: 'Chọn khóa học phù hợp',
    sections: [
      'Mỗi khóa học được mô tả theo đầu ra, số tuần, kỹ năng chính và dạng bài tập cần hoàn thành.',
      'Học viên không chỉ xem bài giảng mà còn có checkpoint, bài code, CV và phỏng vấn để đo tiến độ.',
      'AI hỗ trợ tìm tài nguyên, gợi ý khi kẹt bài và nhắc bước học tiếp theo theo dữ liệu tài khoản.',
    ],
    faq: [
      {
        question: 'Nên chọn khóa học lập trình online nào nếu chưa biết bắt đầu từ đâu?',
        answer:
          'Bạn nên tạo lộ trình trước để hệ thống xác định level, mục tiêu và thời gian học, sau đó chọn gói phù hợp.',
      },
      {
        question: 'Khóa học có phù hợp cho người muốn đi làm nhanh không?',
        answer:
          'Có. MentorMind ưu tiên bài tập, dự án, CV, phỏng vấn và kỹ năng trình bày để rút ngắn khoảng cách với công việc.',
      },
    ],
  },
  {
    slug: 'hoc-lap-trinh-cho-nguoi-moi',
    eyebrow: 'Người mới học lập trình',
    title: 'Học lập trình cho người mới bắt đầu từ nền tảng đến dự án',
    description:
      'Lộ trình học lập trình cho người mới: tư duy lập trình, HTML/CSS/JavaScript, Git, dự án nhỏ, luyện code và chuẩn bị portfolio.',
    keywords: [
      'học lập trình cho người mới',
      'bắt đầu học lập trình',
      'học lập trình từ con số 0',
      'lộ trình học lập trình cho người mới',
      'học code cơ bản',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo lộ trình từ đầu',
    sections: [
      'Bắt đầu bằng tư duy giải quyết vấn đề, biến, hàm, điều kiện, vòng lặp và cách đọc lỗi.',
      'Sau nền tảng, học viên chuyển sang Git, giao diện web, dự án nhỏ và cách trình bày sản phẩm.',
      'Mentor theo dõi để tránh học quá rộng, nhảy công nghệ liên tục hoặc bỏ qua phần nền tảng quan trọng.',
    ],
    faq: [
      {
        question: 'Người mới nên học ngôn ngữ nào trước?',
        answer:
          'Nếu mục tiêu là web, JavaScript là lựa chọn thực tế vì đi từ frontend sang backend NodeJS khá thuận lợi.',
      },
      {
        question: 'Bao lâu thì người mới có thể làm dự án đầu tiên?',
        answer:
          'Tùy thời gian học mỗi tuần, nhưng thường sau vài tuần nền tảng bạn đã có thể làm dự án nhỏ để luyện tư duy sản phẩm.',
      },
    ],
  },
  {
    slug: 'hoc-frontend-online',
    eyebrow: 'Học frontend online',
    title: 'Học frontend online với React, UI thực chiến và portfolio',
    description:
      'Lộ trình học frontend online từ HTML, CSS, JavaScript, React, TypeScript đến dự án portfolio, phỏng vấn và CV frontend.',
    keywords: [
      'học frontend online',
      'học frontend cho người mới',
      'khóa học frontend online',
      'lộ trình học frontend',
      'frontend developer roadmap',
    ],
    primaryHref: '/packages',
    primaryLabel: 'Xem gói frontend',
    sections: [
      'Học viên đi từ layout, responsive, state, form, API, routing đến tối ưu trải nghiệm người dùng.',
      'Bài tập tập trung vào UI thật: dashboard, landing page, auth flow, CRUD và xử lý trạng thái loading/error.',
      'Kết quả học được đóng gói thành portfolio có câu chuyện kỹ thuật để dùng khi phỏng vấn.',
    ],
    faq: [
      {
        question: 'Học frontend có cần biết backend không?',
        answer:
          'Không cần giỏi backend ngay từ đầu, nhưng nên hiểu API, auth, database ở mức đủ phối hợp và debug.',
      },
      {
        question: 'Frontend fresher cần portfolio như thế nào?',
        answer:
          'Nên có 2-3 dự án hoàn chỉnh, responsive tốt, code sạch, README rõ và biết giải thích quyết định kỹ thuật.',
      },
    ],
  },
  {
    slug: 'hoc-reactjs-online',
    eyebrow: 'Học ReactJS online',
    title: 'Học ReactJS online từ component đến dự án thực tế',
    description:
      'Học ReactJS online với component, state, hooks, form, API, routing, performance và dự án thực tế có mentor review.',
    keywords: [
      'học ReactJS online',
      'khóa học ReactJS',
      'học React cho người mới',
      'ReactJS project',
      'React developer roadmap',
    ],
    primaryHref: '/code-practice',
    primaryLabel: 'Luyện React và code',
    sections: [
      'Nắm component thinking, props, state, hooks, effect, form validation và cách chia UI có thể bảo trì.',
      'Luyện gọi API, xử lý loading/error, auth token, protected route và tối ưu render trong tình huống thật.',
      'Mentor review cách đặt tên, tách component, tổ chức folder và giải thích trade-off khi phỏng vấn.',
    ],
    faq: [
      {
        question: 'Có nên học ReactJS trước khi học JavaScript vững không?',
        answer:
          'Không nên nhảy quá nhanh. Bạn cần JavaScript nền tảng như array, object, async/await, module và DOM mindset.',
      },
      {
        question: 'Học ReactJS cần làm dự án gì?',
        answer:
          'Dashboard, e-commerce mini, task app có auth, blog/admin hoặc app gọi API thật là các dự án tốt cho portfolio.',
      },
    ],
  },
  {
    slug: 'hoc-backend-online',
    eyebrow: 'Học backend online',
    title: 'Học backend online với API, database, auth và deployment',
    description:
      'Lộ trình học backend online từ REST API, database, authentication, authorization, testing, logging đến deploy production.',
    keywords: [
      'học backend online',
      'khóa học backend',
      'lộ trình học backend',
      'backend developer roadmap',
      'học API database',
    ],
    primaryHref: '/packages',
    primaryLabel: 'Xem gói backend',
    sections: [
      'Học viên xây API có validation, auth, phân quyền, pagination, upload file, email và xử lý lỗi rõ ràng.',
      'Lộ trình nhấn mạnh database schema, transaction, index, migration và cách đọc log khi production lỗi.',
      'Dự án backend được luyện theo tình huống thật: user, payment, booking, admin, notification và audit log.',
    ],
    faq: [
      {
        question: 'Backend fresher cần biết những gì?',
        answer:
          'Cần nắm HTTP, REST, database, auth, Git, deploy cơ bản, cách debug log và viết API có validation.',
      },
      {
        question: 'Học backend có cần học DevOps không?',
        answer:
          'Không cần thành DevOps, nhưng nên biết deploy VPS, Nginx, SSL, env, process manager và backup database ở mức cơ bản.',
      },
    ],
  },
  {
    slug: 'hoc-nodejs-backend',
    eyebrow: 'Học NodeJS backend',
    title: 'Học NodeJS backend với NestJS, Prisma và PostgreSQL',
    description:
      'Học NodeJS backend từ Express/NestJS, Prisma, PostgreSQL, JWT, refresh token, email, upload file và deploy lên VPS.',
    keywords: [
      'học NodeJS backend',
      'khóa học NodeJS',
      'học NestJS',
      'NodeJS Prisma PostgreSQL',
      'backend NodeJS roadmap',
    ],
    primaryHref: '/code-practice',
    primaryLabel: 'Luyện backend NodeJS',
    sections: [
      'Đi từ JavaScript runtime, async, module, Express/NestJS đến cách thiết kế service, controller và DTO.',
      'Thực hành Prisma, PostgreSQL, migration, seed data, JWT, refresh token, role guard và email OTP.',
      'Deploy NodeJS bằng PM2, Nginx, SSL, env production và checklist xử lý lỗi thường gặp trên VPS.',
    ],
    faq: [
      {
        question: 'NodeJS backend có phù hợp fresher không?',
        answer:
          'Có, đặc biệt nếu bạn đã học JavaScript/React và muốn đi fullstack nhanh hơn.',
      },
      {
        question: 'NestJS khác Express như thế nào?',
        answer:
          'Express linh hoạt và nhẹ; NestJS có cấu trúc module/service rõ hơn, phù hợp dự án lớn và team cần chuẩn hóa.',
      },
    ],
  },
  {
    slug: 'hoc-fullstack-online',
    eyebrow: 'Học fullstack online',
    title: 'Học fullstack online từ frontend, backend đến deploy',
    description:
      'Lộ trình học fullstack online với React/Next.js, NodeJS/NestJS, database, auth, payment, admin dashboard và deployment.',
    keywords: [
      'học fullstack online',
      'khóa học fullstack',
      'fullstack developer roadmap',
      'học React NodeJS',
      'học NextJS fullstack',
    ],
    primaryHref: '/packages',
    primaryLabel: 'Xem gói fullstack',
    sections: [
      'Fullstack không chỉ ghép frontend và backend mà còn hiểu luồng dữ liệu, quyền truy cập và trải nghiệm người dùng.',
      'Dự án luyện các module thực tế: auth, dashboard, thanh toán, admin, file upload, notification và analytics.',
      'Mentor giúp chia milestone để không bị ngợp giữa quá nhiều công nghệ và vẫn có sản phẩm deploy được.',
    ],
    faq: [
      {
        question: 'Học fullstack có quá khó cho người mới không?',
        answer:
          'Có thể khó nếu học dàn trải. MentorMind chia theo mốc: nền tảng web, frontend, backend, database rồi deploy.',
      },
      {
        question: 'Fullstack fresher cần dự án gì?',
        answer:
          'Một SaaS mini, booking app, learning platform, e-commerce hoặc dashboard có auth, database và deploy thật sẽ thuyết phục hơn todo app đơn giản.',
      },
    ],
  },
  {
    slug: 'hoc-data-analyst-online',
    eyebrow: 'Học Data Analyst online',
    title: 'Học Data Analyst online với SQL, dashboard và portfolio',
    description:
      'Lộ trình học Data Analyst online từ Excel/Sheets, SQL, Python cơ bản, dashboard, storytelling đến portfolio phân tích dữ liệu.',
    keywords: [
      'học Data Analyst online',
      'lộ trình Data Analyst',
      'khóa học phân tích dữ liệu',
      'học SQL dashboard',
      'Data Analyst portfolio',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo lộ trình Data',
    sections: [
      'Bắt đầu với tư duy câu hỏi kinh doanh, làm sạch dữ liệu, SQL query, metric và dashboard đọc được.',
      'Luyện case theo ngành: bán hàng, giáo dục, fintech, vận hành, marketing và cohort/retention.',
      'Portfolio tập trung vào insight, cách kể chuyện dữ liệu và quyết định có thể hành động, không chỉ biểu đồ đẹp.',
    ],
    faq: [
      {
        question: 'Data Analyst có cần giỏi lập trình không?',
        answer:
          'Không cần như software engineer, nhưng nên biết SQL chắc, spreadsheet tốt và Python cơ bản để xử lý dữ liệu.',
      },
      {
        question: 'Portfolio Data Analyst nên có gì?',
        answer:
          'Nên có dataset, câu hỏi phân tích, dashboard, insight, khuyến nghị và phần giải thích phương pháp rõ ràng.',
      },
    ],
  },
  {
    slug: 'hoc-ai-machine-learning',
    eyebrow: 'Học AI Machine Learning',
    title: 'Học AI Machine Learning theo lộ trình có dự án',
    description:
      'Lộ trình học AI Machine Learning từ Python, toán nền tảng, ML cổ điển, deep learning, LLM workflow đến dự án ứng dụng.',
    keywords: [
      'học AI machine learning',
      'lộ trình học AI',
      'học machine learning online',
      'học AI cho người mới',
      'AI project portfolio',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo roadmap AI',
    sections: [
      'Lộ trình cân bằng giữa nền tảng Python/toán, mô hình ML, đánh giá mô hình và ứng dụng vào bài toán thật.',
      'Dự án ưu tiên khả năng giải thích dữ liệu, chọn metric, tránh overfitting và trình bày kết quả rõ ràng.',
      'Với hướng LLM, học viên luyện prompt workflow, RAG, tool use, đánh giá output và an toàn dữ liệu.',
    ],
    faq: [
      {
        question: 'Học AI có cần toán rất giỏi không?',
        answer:
          'Cần hiểu toán ở mức dùng được: xác suất, đạo hàm, vector/matrix và metric; không nhất thiết phải học quá hàn lâm từ đầu.',
      },
      {
        question: 'Người mới nên học AI hay web trước?',
        answer:
          'Nếu chưa có nền lập trình, nên học Python hoặc web nền tảng trước, sau đó vào data/AI để học hiệu quả hơn.',
      },
    ],
  },
  {
    slug: 'lo-trinh-hoc-frontend',
    eyebrow: 'Roadmap frontend',
    title: 'Lộ trình học frontend từ cơ bản đến đi phỏng vấn',
    description:
      'Roadmap frontend gồm HTML/CSS, JavaScript, React, TypeScript, API, testing, performance, portfolio và luyện phỏng vấn.',
    keywords: [
      'lộ trình học frontend',
      'frontend roadmap',
      'học frontend từ đầu',
      'frontend interview roadmap',
      'React TypeScript roadmap',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo roadmap frontend',
    sections: [
      'Giai đoạn 1 xây nền HTML/CSS/JS và tư duy layout responsive, accessibility, semantic HTML.',
      'Giai đoạn 2 học React, TypeScript, state, API, form, routing và cấu trúc dự án.',
      'Giai đoạn 3 làm portfolio, tối ưu performance, luyện phỏng vấn và chuẩn bị CV frontend.',
    ],
    faq: [
      {
        question: 'Frontend roadmap nên kéo dài bao lâu?',
        answer:
          'Nếu học đều 8-12 giờ/tuần, thường cần vài tháng để có nền tảng, dự án và khả năng phỏng vấn cơ bản.',
      },
      {
        question: 'Có nên học Tailwind CSS không?',
        answer:
          'Có thể học sau khi hiểu CSS nền tảng. Tailwind giúp làm UI nhanh, nhưng không thay thế kiến thức layout và responsive.',
      },
    ],
  },
  {
    slug: 'lo-trinh-hoc-backend',
    eyebrow: 'Roadmap backend',
    title: 'Lộ trình học backend từ API đến deploy production',
    description:
      'Roadmap backend gồm HTTP, REST API, database, authentication, authorization, queue, logging, testing và deploy VPS.',
    keywords: [
      'lộ trình học backend',
      'backend roadmap',
      'học backend từ đầu',
      'backend interview roadmap',
      'API database auth deploy',
    ],
    primaryHref: '/create-roadmap',
    primaryLabel: 'Tạo roadmap backend',
    sections: [
      'Giai đoạn đầu học HTTP, REST, validation, error handling, database schema và CRUD chuẩn.',
      'Giai đoạn giữa học auth, role guard, transaction, upload file, email, payment hoặc integration bên thứ ba.',
      'Giai đoạn cuối luyện deploy, logging, monitoring, backup, security checklist và phỏng vấn system/API design.',
    ],
    faq: [
      {
        question: 'Backend roadmap có cần học microservices không?',
        answer:
          'Fresher/junior nên ưu tiên monolith sạch, database, auth, logging và deploy trước; microservices học sau khi có nền hệ thống.',
      },
      {
        question: 'Backend cần học testing không?',
        answer:
          'Có. Ít nhất nên biết unit test/service test và cách test API để giảm lỗi khi refactor hoặc deploy.',
      },
    ],
  },
  {
    slug: 'luyen-phong-van-frontend',
    eyebrow: 'Phỏng vấn frontend',
    title: 'Luyện phỏng vấn frontend với câu hỏi React, JS và dự án',
    description:
      'Luyện phỏng vấn frontend theo rubric: JavaScript, React, CSS, performance, accessibility, dự án portfolio và tình huống team.',
    keywords: [
      'luyện phỏng vấn frontend',
      'câu hỏi phỏng vấn React',
      'phỏng vấn JavaScript',
      'frontend interview',
      'mock interview frontend',
    ],
    primaryHref: '/ai-interview',
    primaryLabel: 'Luyện phỏng vấn frontend',
    sections: [
      'Câu hỏi phủ JavaScript core, async, closure, event loop, DOM, React hooks và state management.',
      'AI chấm câu trả lời theo clarity, correctness, depth và khả năng liên hệ với dự án thật.',
      'Học viên luyện cách kể portfolio: vấn đề, giải pháp, trade-off, bug khó và kết quả đạt được.',
    ],
    faq: [
      {
        question: 'Frontend interview thường hỏi gì?',
        answer:
          'Thường hỏi JS nền tảng, React hooks, CSS layout, API flow, performance, accessibility và giải thích dự án đã làm.',
      },
      {
        question: 'Có luyện được behavioral interview không?',
        answer:
          'Có. Bạn có thể luyện cách kể teamwork, conflict, ownership, learning mindset và cách nhận feedback.',
      },
    ],
  },
  {
    slug: 'luyen-phong-van-backend',
    eyebrow: 'Phỏng vấn backend',
    title: 'Luyện phỏng vấn backend với API, database và system design cơ bản',
    description:
      'Luyện phỏng vấn backend theo tình huống API, auth, database, transaction, logging, deploy, security và system design cơ bản.',
    keywords: [
      'luyện phỏng vấn backend',
      'backend interview',
      'câu hỏi phỏng vấn backend',
      'phỏng vấn API database',
      'mock interview backend',
    ],
    primaryHref: '/ai-interview',
    primaryLabel: 'Luyện phỏng vấn backend',
    sections: [
      'Câu hỏi đi từ HTTP, REST, status code, database schema, transaction đến auth và phân quyền.',
      'Mock interview yêu cầu giải thích thiết kế API, cách xử lý lỗi, log, retry và bảo vệ dữ liệu.',
      'Feedback giúp học viên trả lời có cấu trúc: requirement, trade-off, edge case và phương án kiểm thử.',
    ],
    faq: [
      {
        question: 'Backend fresher có bị hỏi system design không?',
        answer:
          'Có thể có ở mức cơ bản: thiết kế API, bảng dữ liệu, luồng auth, caching đơn giản và cách scale ở mức khái niệm.',
      },
      {
        question: 'Nên chuẩn bị gì trước backend interview?',
        answer:
          'Chuẩn bị dự án backend đã deploy, hiểu schema, auth, error handling, log và biết kể bug khó từng xử lý.',
      },
    ],
  },
  {
    slug: 'portfolio-lap-trinh-vien',
    eyebrow: 'Portfolio lập trình viên',
    title: 'Làm portfolio lập trình viên để xin intern, fresher, junior',
    description:
      'Xây portfolio lập trình viên có dự án thật, README rõ, demo deploy, CV ATS và câu chuyện kỹ thuật để đi phỏng vấn.',
    keywords: [
      'portfolio lập trình viên',
      'portfolio frontend',
      'portfolio backend',
      'dự án xin việc IT',
      'CV portfolio lập trình',
    ],
    primaryHref: '/dashboard/cv-review',
    primaryLabel: 'Review CV và portfolio',
    sections: [
      'Portfolio tốt không cần quá nhiều dự án, nhưng mỗi dự án phải có mục tiêu, tính năng, demo và giải thích kỹ thuật.',
      'README nên nói rõ stack, cách chạy, tính năng, ảnh demo, trade-off và phần bạn tự làm.',
      'MentorMind nối portfolio với CV và mock interview để bạn biết cách kể dự án cho nhà tuyển dụng.',
    ],
    faq: [
      {
        question: 'Portfolio lập trình viên cần bao nhiêu dự án?',
        answer:
          'Thường 2-3 dự án tốt, deploy được và giải thích được sâu sẽ hơn nhiều dự án nhỏ nhưng thiếu chất lượng.',
      },
      {
        question: 'Có cần mua domain riêng cho portfolio không?',
        answer:
          'Không bắt buộc, nhưng có domain/demo ổn định, README rõ và GitHub sạch sẽ tạo ấn tượng tốt hơn.',
      },
    ],
  },
] as const;

export type SeoLandingPage = (typeof seoLandingPages)[number];
