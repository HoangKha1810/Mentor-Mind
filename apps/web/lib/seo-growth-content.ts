export type ContentFaq = {
  question: string;
  answer: string;
};

export type SeoArticle = {
  slug: string;
  title: string;
  description: string;
  keyword: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  tone: 'cyan' | 'violet' | 'emerald' | 'orange' | 'rose' | 'blue';
  takeaways: string[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
  faqs: ContentFaq[];
  related: string[];
};

export type SeoCourse = {
  slug: string;
  title: string;
  description: string;
  audience: string;
  level: string;
  duration: string;
  primaryKeywords: string[];
  outcomes: string[];
  modules: Array<{
    title: string;
    description: string;
    lessons: string[];
  }>;
  faqs: ContentFaq[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  description: string;
  persona: string;
  problem: string;
  timeline: string[];
  approach: string[];
  signals: string[];
  keywords: string[];
  disclaimer: string;
  faqs: ContentFaq[];
};

export type FaqGroup = {
  title: string;
  description: string;
  items: ContentFaq[];
};

export const blogArticles: SeoArticle[] = [
  {
    slug: 'lo-trinh-hoc-lap-trinh-cho-nguoi-moi',
    title: 'Lộ trình học lập trình cho người mới: từ con số 0 đến dự án đầu tiên',
    description:
      'Hướng dẫn học lập trình cho người mới với roadmap rõ ràng: tư duy code, JavaScript, Git, dự án web, portfolio và luyện phỏng vấn.',
    keyword: 'lộ trình học lập trình cho người mới',
    category: 'Roadmap',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 9,
    tone: 'cyan',
    takeaways: [
      'Đừng bắt đầu bằng quá nhiều công nghệ; hãy học tư duy lập trình và JavaScript nền tảng trước.',
      'Sau nền tảng, làm dự án nhỏ có demo thật để chuyển kiến thức thành năng lực nhìn thấy được.',
      'Portfolio, CV và phỏng vấn nên được luyện song song từ sớm, không đợi học xong mới chuẩn bị.',
    ],
    sections: [
      {
        heading: 'Giai đoạn 1: học cách nghĩ như lập trình viên',
        body: [
          'Người mới thường hỏi nên học ngôn ngữ nào, nhưng câu hỏi quan trọng hơn là học cách chia bài toán thành bước nhỏ. Hãy bắt đầu với biến, kiểu dữ liệu, điều kiện, vòng lặp, hàm, array, object và cách đọc lỗi.',
          'Nếu mục tiêu là web hoặc fullstack, JavaScript là lựa chọn hợp lý vì bạn có thể dùng cùng một nền tảng để đi từ frontend sang NodeJS backend.',
        ],
      },
      {
        heading: 'Giai đoạn 2: làm web cơ bản và hiểu luồng dữ liệu',
        body: [
          'Học HTML semantic, CSS layout, responsive, JavaScript DOM, form, fetch API và Git. Một dự án nhỏ như todo nâng cao, landing page có form, dashboard mini hoặc blog cá nhân sẽ tốt hơn học lý thuyết rời rạc.',
          'Mỗi dự án nên có README, ảnh demo, link deploy và phần “tôi học được gì”. Đây chính là mầm portfolio đầu tiên.',
        ],
      },
      {
        heading: 'Giai đoạn 3: chọn hướng frontend, backend, fullstack hoặc data',
        body: [
          'Khi đã có nền, bạn mới nên chọn nhánh. Frontend đi sâu React, UI, state, performance. Backend đi sâu API, database, auth, deploy. Fullstack cần hiểu cả luồng sản phẩm. Data/AI cần SQL, Python và tư duy phân tích.',
          'MentorMind tạo roadmap theo mục tiêu, thời gian học mỗi tuần và dữ liệu CV để tránh việc học lan man.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Người mới học lập trình nên học bao lâu mỗi ngày?',
        answer:
          'Nếu có thể, 1-2 giờ mỗi ngày đều đặn tốt hơn học dồn cuối tuần. Quan trọng nhất là có bài tập và dự án nhỏ để áp dụng ngay.',
      },
      {
        question: 'Có cần học toán trước khi học lập trình không?',
        answer:
          'Không cần học toán quá sâu nếu mục tiêu ban đầu là web. Bạn cần tư duy logic, sau đó bổ sung toán khi đi vào thuật toán, data hoặc AI.',
      },
    ],
    related: ['hoc-lap-trinh-cho-nguoi-moi', 'hoc-lap-trinh-online', 'khoa-hoc-lap-trinh-online'],
  },
  {
    slug: 'hoc-frontend-online-tu-html-css-den-react',
    title: 'Học frontend online: từ HTML, CSS, JavaScript đến React và portfolio',
    description:
      'Roadmap học frontend online cho người muốn đi làm: nền tảng web, React, TypeScript, API, UI thực chiến, portfolio và câu hỏi phỏng vấn.',
    keyword: 'học frontend online',
    category: 'Frontend',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 10,
    tone: 'violet',
    takeaways: [
      'Frontend đi làm cần nhiều hơn giao diện đẹp: phải hiểu data flow, API, state, form và UX khi lỗi.',
      'React nên học sau khi đã chắc JavaScript nền tảng, không nên nhảy thẳng vào framework.',
      'Portfolio frontend nên có 2-3 dự án hoàn chỉnh, responsive tốt và giải thích được quyết định kỹ thuật.',
    ],
    sections: [
      {
        heading: 'Nền tảng không thể bỏ qua',
        body: [
          'HTML semantic, CSS layout, responsive, accessibility và JavaScript core là phần quyết định bạn có debug được dự án thật hay không.',
          'Một lỗi phổ biến là học Tailwind hoặc React quá sớm nhưng không hiểu box model, flex/grid, event, async/await và cách trình duyệt render.',
        ],
      },
      {
        heading: 'React và TypeScript nên học như sản phẩm thật',
        body: [
          'Hãy luyện component thinking, props, state, hooks, form validation, route, protected page, API states và performance cơ bản.',
          'Dự án tốt gồm login, dashboard, search/filter, form nhiều bước, trạng thái loading/error/empty và dữ liệu từ API thật.',
        ],
      },
      {
        heading: 'Portfolio frontend cần kể được câu chuyện',
        body: [
          'Nhà tuyển dụng không chỉ xem giao diện. Họ muốn biết bạn gặp vấn đề gì, chọn giải pháp nào, trade-off ra sao và bạn test/debug như thế nào.',
          'MentorMind nối phần học frontend với luyện phỏng vấn và review CV để dự án không nằm yên trong GitHub.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Frontend fresher cần biết React ở mức nào?',
        answer:
          'Cần hiểu component, props, state, hooks, form, gọi API, routing, state loading/error và biết tách component hợp lý.',
      },
      {
        question: 'Có nên học Next.js ngay sau React không?',
        answer:
          'Có thể, nhưng nên chắc React trước. Next.js thêm routing, SSR/SSG, metadata, server/client components và deployment.',
      },
    ],
    related: ['hoc-frontend-online', 'hoc-reactjs-online', 'lo-trinh-hoc-frontend'],
  },
  {
    slug: 'hoc-reactjs-online-va-du-an-portfolio',
    title: 'Học ReactJS online: 7 dạng dự án portfolio nên làm',
    description:
      'Gợi ý dự án ReactJS cho portfolio: dashboard, booking, e-commerce mini, blog/admin, learning app, CV analyzer và interview tracker.',
    keyword: 'học ReactJS online',
    category: 'ReactJS',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 8,
    tone: 'blue',
    takeaways: [
      'Dự án React tốt cần có data flow, form, API, route, trạng thái lỗi và deploy thật.',
      'README và demo quan trọng gần như code vì giúp nhà tuyển dụng hiểu năng lực của bạn nhanh hơn.',
      'Nên chọn dự án gắn với ngành hoặc vai trò mục tiêu để câu chuyện phỏng vấn tự nhiên hơn.',
    ],
    sections: [
      {
        heading: 'Dự án 1-3: dashboard, booking, e-commerce mini',
        body: [
          'Dashboard giúp luyện chart, filter, table, empty state và responsive. Booking app luyện calendar, form nhiều bước và trạng thái lịch. E-commerce mini luyện cart, payment mock và quản lý dữ liệu.',
          'Ba dạng này đều có thể mở rộng thành fullstack khi bạn học backend.',
        ],
      },
      {
        heading: 'Dự án 4-5: blog/admin và learning tracker',
        body: [
          'Blog/admin giúp luyện CRUD, editor, upload, role admin và SEO metadata. Learning tracker phù hợp với người muốn thể hiện khả năng thiết kế sản phẩm giáo dục hoặc productivity.',
          'Nếu dùng TypeScript, hãy cố gắng type dữ liệu API và form thay vì dùng any để qua nhanh.',
        ],
      },
      {
        heading: 'Dự án 6-7: CV analyzer và interview tracker',
        body: [
          'CV analyzer giúp bạn kể câu chuyện AI ứng dụng: upload file, parse, scoring, keyword gap. Interview tracker luyện câu hỏi, câu trả lời, rubric và lịch sử tiến bộ.',
          'Đây là nhóm dự án rất hợp với portfolio ứng viên IT vì nối trực tiếp tới bài toán tuyển dụng.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Dự án React có cần backend thật không?',
        answer:
          'Không bắt buộc lúc đầu, nhưng có backend hoặc API mock tốt sẽ giúp dự án sát thực tế hơn nhiều.',
      },
      {
        question: 'Nên deploy dự án React ở đâu?',
        answer:
          'Vercel, Netlify hoặc VPS đều được. Điều quan trọng là demo truy cập ổn định và README có hướng dẫn rõ.',
      },
    ],
    related: ['hoc-reactjs-online', 'portfolio-lap-trinh-vien', 'luyen-phong-van-frontend'],
  },
  {
    slug: 'hoc-nodejs-backend-api-auth-database',
    title: 'Học NodeJS backend: API, auth, database và deploy production',
    description:
      'Roadmap học NodeJS backend với NestJS/Express, Prisma, PostgreSQL, JWT, refresh token, email OTP, logging và deploy VPS.',
    keyword: 'học NodeJS backend',
    category: 'Backend',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 11,
    tone: 'emerald',
    takeaways: [
      'Backend đi làm cần hiểu HTTP, database, auth, validation, logging và deploy, không chỉ CRUD.',
      'NodeJS rất hợp với người đã học JavaScript/React và muốn đi fullstack.',
      'Dự án backend nên có tài liệu API, seed data, error handling và checklist bảo mật cơ bản.',
    ],
    sections: [
      {
        heading: 'Từ Express đến NestJS: học cấu trúc thay vì chỉ chạy được',
        body: [
          'Express giúp hiểu request/response, middleware và route. NestJS giúp tổ chức module, controller, service, guard, pipe rõ ràng hơn cho dự án lớn.',
          'Dù dùng framework nào, hãy luyện DTO/validation, error format thống nhất và phân tách business logic khỏi controller.',
        ],
      },
      {
        heading: 'Database và auth là xương sống',
        body: [
          'Học schema, relation, index, transaction, migration và seed data. Với auth, cần hiểu password hashing, JWT access token, refresh token, cookie, CORS và role guard.',
          'Đừng bỏ qua các flow như forgot password, email OTP, logout idempotent và revoke token.',
        ],
      },
      {
        heading: 'Deploy để hiểu production thật',
        body: [
          'Một backend chưa deploy thường chưa bộc lộ lỗi env, CORS, SSL, Nginx, PM2, database connection và log.',
          'MentorMind có thể biến các lỗi deploy thật thành checklist học backend rất giá trị cho fresher/junior.',
        ],
      },
    ],
    faqs: [
      {
        question: 'NodeJS backend có khó hơn frontend không?',
        answer:
          'Khó theo kiểu khác. Backend cần tư duy dữ liệu, bảo mật, quyền truy cập, log và xử lý lỗi hệ thống nhiều hơn UI.',
      },
      {
        question: 'Có nên học Prisma khi học backend không?',
        answer:
          'Có thể. Prisma giúp làm việc với database nhanh hơn, nhưng bạn vẫn nên hiểu SQL, relation, index và migration.',
      },
    ],
    related: ['hoc-nodejs-backend', 'hoc-backend-online', 'lo-trinh-hoc-backend'],
  },
  {
    slug: 'luyen-phong-van-frontend-react-javascript',
    title: 'Luyện phỏng vấn frontend: React, JavaScript và cách kể dự án',
    description:
      'Checklist luyện phỏng vấn frontend với JavaScript core, React hooks, CSS layout, performance, accessibility, portfolio và behavioral questions.',
    keyword: 'luyện phỏng vấn frontend',
    category: 'Interview',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 8,
    tone: 'orange',
    takeaways: [
      'Phỏng vấn frontend thường hỏi từ nền tảng JavaScript đến cách bạn xử lý UI trong dự án thật.',
      'Câu trả lời tốt có cấu trúc: vấn đề, lựa chọn, trade-off, edge case và kết quả.',
      'Mock interview nên có rubric để bạn biết mình yếu ở kiến thức, diễn đạt hay chiều sâu dự án.',
    ],
    sections: [
      {
        heading: 'Nhóm câu hỏi JavaScript và browser',
        body: [
          'Ôn closure, scope, hoisting, async/await, promise, event loop, array methods, object, DOM event và fetch API.',
          'Bạn không cần trả lời như sách giáo khoa, nhưng phải giải thích được bằng ví dụ trong dự án.',
        ],
      },
      {
        heading: 'Nhóm câu hỏi React và UI',
        body: [
          'Chuẩn bị props/state, controlled form, useEffect, useMemo/useCallback khi nào cần, component composition, API states và routing.',
          'Với CSS, hãy luyện flex/grid, responsive, z-index, animation cơ bản và accessibility.',
        ],
      },
      {
        heading: 'Cách kể dự án portfolio',
        body: [
          'Một dự án nên kể theo flow: bối cảnh, tính năng chính, phần khó nhất, lỗi từng gặp, cách debug, trade-off và điều sẽ cải thiện.',
          'MentorMind dùng mock interview AI để chấm clarity, correctness và depth sau từng câu trả lời.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Có nên học thuộc câu trả lời phỏng vấn frontend không?',
        answer:
          'Không nên học thuộc máy móc. Hãy chuẩn bị ý chính và luyện nói bằng dự án thật của bạn.',
      },
      {
        question: 'Frontend interview có hỏi thuật toán không?',
        answer:
          'Có thể có, thường ở mức array/string, object, recursion đơn giản hoặc bài xử lý dữ liệu UI.',
      },
    ],
    related: ['luyen-phong-van-frontend', 'hoc-reactjs-online', 'portfolio-lap-trinh-vien'],
  },
  {
    slug: 'sua-cv-ats-it-cho-fresher',
    title: 'Sửa CV ATS IT cho fresher: keyword, bullet point và portfolio',
    description:
      'Cách sửa CV ATS cho ứng viên IT: chọn keyword đúng JD, viết bullet point có kết quả, trình bày project và tránh lỗi phổ biến.',
    keyword: 'sửa CV ATS IT',
    category: 'CV',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 9,
    tone: 'rose',
    takeaways: [
      'CV IT cần khớp role mục tiêu, không nên dùng một bản cho mọi JD.',
      'Bullet point tốt nói rõ hành động, công nghệ, quy mô và kết quả hoặc tín hiệu chất lượng.',
      'Portfolio/GitHub/README giúp nhà tuyển dụng kiểm chứng năng lực nhanh hơn.',
    ],
    sections: [
      {
        heading: 'ATS keyword không phải nhồi từ khóa',
        body: [
          'Keyword nên đến từ JD: React, TypeScript, NodeJS, REST API, SQL, testing, Git, Docker, cloud, teamwork. Nhưng bạn chỉ nên đưa keyword nếu thật sự có thể giải thích.',
          'Một CV nhồi từ khóa nhưng không có dự án chứng minh sẽ dễ bị rớt ở vòng phỏng vấn.',
        ],
      },
      {
        heading: 'Bullet point nên có bằng chứng',
        body: [
          'Thay vì viết “biết React”, hãy viết “xây dashboard React/TypeScript gồm filter, table, auth flow và API error states”.',
          'Nếu chưa có số liệu thật, dùng tín hiệu kỹ thuật: test case, performance, deploy, số module, số endpoint hoặc quy trình review.',
        ],
      },
      {
        heading: 'Project section là nơi fresher thắng điểm',
        body: [
          'Dự án nên có link demo, GitHub, stack, tính năng, phần bạn phụ trách và một lỗi khó từng giải quyết.',
          'MentorMind dùng CV review để nối keyword thiếu với roadmap và câu hỏi phỏng vấn tương ứng.',
        ],
      },
    ],
    faqs: [
      {
        question: 'CV fresher IT nên dài mấy trang?',
        answer:
          'Thường 1 trang là tốt. Nếu có nhiều dự án chất lượng, vẫn nên ưu tiên thông tin khớp role mục tiêu.',
      },
      {
        question: 'Có nên đưa điểm GPA vào CV IT không?',
        answer:
          'Nếu GPA tốt hoặc JD quan tâm học thuật, có thể đưa. Nếu không nổi bật, hãy ưu tiên dự án, kỹ năng và kinh nghiệm thực hành.',
      },
    ],
    related: ['sua-cv-ats-it', 'portfolio-lap-trinh-vien', 'luyen-phong-van-ai'],
  },
  {
    slug: 'hoc-ai-machine-learning-cho-nguoi-moi',
    title: 'Học AI Machine Learning cho người mới: Python, toán và dự án',
    description:
      'Roadmap học AI Machine Learning cho người mới với Python, SQL, xác suất, ML cổ điển, deep learning, LLM workflow và portfolio.',
    keyword: 'học AI machine learning',
    category: 'AI',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 10,
    tone: 'blue',
    takeaways: [
      'Người mới nên học Python và dữ liệu trước khi nhảy vào mô hình phức tạp.',
      'Dự án AI tốt cần giải thích dữ liệu, metric, lỗi mô hình và ứng dụng thật.',
      'LLM workflow như RAG/tool use nên học cùng cách đánh giá output và bảo vệ dữ liệu.',
    ],
    sections: [
      {
        heading: 'Nền tảng Python, SQL và toán vừa đủ',
        body: [
          'Python giúp xử lý dữ liệu, viết notebook, gọi API và xây prototype. SQL giúp lấy dữ liệu đúng. Toán cần xác suất, thống kê, vector/matrix và đạo hàm ở mức hiểu mô hình hoạt động.',
          'Đừng mắc kẹt vì toán quá lâu; hãy học đủ để làm dự án và quay lại đào sâu khi cần.',
        ],
      },
      {
        heading: 'ML cổ điển trước deep learning',
        body: [
          'Linear/logistic regression, tree, random forest, gradient boosting, clustering và evaluation metric là nền tảng thực tế.',
          'Bạn cần hiểu train/test split, overfitting, leakage, feature engineering và cách chọn metric theo bài toán.',
        ],
      },
      {
        heading: 'LLM và AI ứng dụng',
        body: [
          'Với LLM, hãy học prompt workflow, RAG, embedding, tool use, guardrail, evaluation và logging.',
          'MentorMind có thể tạo roadmap AI theo mục tiêu: data analyst, ML engineer, AI app developer hoặc automation.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Học AI có cần máy mạnh không?',
        answer:
          'Không nhất thiết lúc đầu. Bạn có thể học bằng notebook cloud, dataset nhỏ và API model trước khi cần GPU riêng.',
      },
      {
        question: 'AI portfolio nên có dự án gì?',
        answer:
          'Nên có dự án phân tích dữ liệu, mô hình dự đoán có metric, và một ứng dụng AI/LLM có demo rõ ràng.',
      },
    ],
    related: ['hoc-ai-machine-learning', 'lo-trinh-hoc-ai-ca-nhan-hoa', 'hoc-data-analyst-online'],
  },
  {
    slug: 'deploy-nextjs-nestjs-vps-nginx-ssl',
    title: 'Deploy Next.js và NestJS lên VPS: Nginx, SSL, PM2 và DNS',
    description:
      'Checklist deploy app fullstack Next.js/NestJS lên VPS: DNS A record, api subdomain, Nginx reverse proxy, Certbot SSL, PM2 và lỗi thường gặp.',
    keyword: 'deploy Next.js NestJS VPS',
    category: 'Deployment',
    publishedAt: '2026-07-11',
    updatedAt: '2026-07-11',
    readMinutes: 12,
    tone: 'emerald',
    takeaways: [
      'Web và API nên có domain rõ ràng: mentormind.center cho web, api.mentormind.center cho backend.',
      'Nginx reverse proxy, SSL, env production và PM2 là các mảnh dễ sai nhất khi deploy VPS.',
      'Debug nên đi từ DNS → Nginx → process → local curl → browser network.',
    ],
    sections: [
      {
        heading: 'DNS và subdomain API',
        body: [
          'Tạo A record cho domain chính và api subdomain về IP VPS. Sau khi đổi IP, cần kiểm tra cache DNS bằng dig qua nhiều resolver.',
          'Nếu VPS curl được nhưng máy ngoài timeout, nguyên nhân thường là DNS cache hoặc firewall/security group.',
        ],
      },
      {
        heading: 'Nginx reverse proxy và SSL',
        body: [
          'Web Next.js thường chạy port 3000, API NestJS chạy port 4000. Nginx nhận 80/443 rồi proxy về port nội bộ.',
          'Certbot nginx plugin giúp tự cấu hình SSL. Nếu báo thiếu plugin, cài python3-certbot-nginx rồi chạy lại certbot.',
        ],
      },
      {
        heading: 'PM2, env và build production',
        body: [
          'NEXT_PUBLIC_API_URL được đóng gói lúc build web, nên đổi env xong phải build lại. API env cần CORS_ORIGIN đúng domain web.',
          'PM2 nên chạy script start ổn định, không trỏ cứng vào dist/main.js nếu build output có thể nằm ở dist/src/main.js.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Nên dùng /api hay api subdomain?',
        answer:
          'Cả hai đều được. Subdomain api.mentormind.center tách trách nhiệm rõ hơn, còn /api tiện nếu muốn same-origin proxy.',
      },
      {
        question: 'Vì sao API pending trên browser?',
        answer:
          'Thường do DNS trỏ sai, Nginx proxy sai upstream, API process chết, CORS/env sai hoặc request đang vào nhầm Next.js.',
      },
    ],
    related: ['hoc-nodejs-backend', 'hoc-backend-online', 'hoc-fullstack-online'],
  },
];

export const seoCourses: SeoCourse[] = [
  {
    slug: 'frontend-react-di-lam',
    title: 'Khóa học Frontend React đi làm',
    description:
      'Học frontend từ HTML/CSS/JavaScript đến React, TypeScript, API, UI thực chiến, portfolio và phỏng vấn fresher.',
    audience: 'Người mới hoặc người đã biết web cơ bản muốn đi frontend intern/fresher.',
    level: 'Beginner → Job-ready',
    duration: '12 tuần',
    primaryKeywords: ['khóa học frontend online', 'học ReactJS online', 'lộ trình học frontend'],
    outcomes: [
      'Tự xây giao diện responsive và component React có thể bảo trì.',
      'Làm 2 dự án portfolio có API, auth flow, form và dashboard.',
      'Chuẩn bị CV frontend và mock interview theo rubric.',
    ],
    modules: [
      {
        title: 'Nền tảng web',
        description: 'HTML semantic, CSS layout, responsive, JavaScript core và Git.',
        lessons: ['HTML/CSS nền tảng', 'Flex/Grid/responsive', 'JavaScript array/object/async', 'Git workflow'],
      },
      {
        title: 'React và TypeScript',
        description: 'Component, state, hooks, form, API states và cấu trúc dự án.',
        lessons: ['Component thinking', 'Hooks và form', 'API loading/error', 'TypeScript cho UI'],
      },
      {
        title: 'Portfolio và phỏng vấn',
        description: 'Dự án thực chiến, README, deploy, CV và mock interview.',
        lessons: ['Dashboard project', 'Portfolio README', 'CV ATS frontend', 'Mock interview React'],
      },
    ],
    faqs: [
      {
        question: 'Khóa frontend có phù hợp người mới không?',
        answer:
          'Có, nếu bạn sẵn sàng học đều và làm bài tập. Lộ trình bắt đầu từ nền tảng web trước khi vào React.',
      },
      {
        question: 'Có mentor review code không?',
        answer:
          'Có thể kết hợp mentor 1-1 tùy gói học để review code, roadmap, CV và phỏng vấn.',
      },
    ],
  },
  {
    slug: 'backend-nodejs-nestjs',
    title: 'Khóa học Backend NodeJS/NestJS',
    description:
      'Học backend NodeJS với REST API, NestJS, Prisma, PostgreSQL, JWT, role guard, email OTP, logging và deploy VPS.',
    audience: 'Người muốn đi backend hoặc fullstack với nền JavaScript.',
    level: 'Intermediate',
    duration: '10 tuần',
    primaryKeywords: ['khóa học NodeJS', 'học backend online', 'học NestJS'],
    outcomes: [
      'Thiết kế API có validation, auth, phân quyền và error handling.',
      'Làm việc với PostgreSQL, Prisma, migration, seed data và transaction.',
      'Deploy API lên VPS với PM2, Nginx, SSL và env production.',
    ],
    modules: [
      {
        title: 'API foundation',
        description: 'HTTP, REST, DTO, validation, service/controller và error format.',
        lessons: ['HTTP/status code', 'NestJS module/service', 'DTO validation', 'API pagination'],
      },
      {
        title: 'Database và authentication',
        description: 'Prisma, PostgreSQL, JWT, refresh token, role guard và email flow.',
        lessons: ['Schema design', 'Migration/seed', 'Access/refresh token', 'Admin 2FA/email OTP'],
      },
      {
        title: 'Production backend',
        description: 'Logging, Nginx, PM2, SSL, CORS, backup và debugging.',
        lessons: ['PM2 process', 'Nginx proxy', 'SSL Certbot', 'Debug pending API'],
      },
    ],
    faqs: [
      {
        question: 'Khóa backend có cần biết frontend trước không?',
        answer:
          'Không bắt buộc, nhưng biết JavaScript và cách frontend gọi API sẽ giúp học nhanh hơn.',
      },
      {
        question: 'Có học deploy thật không?',
        answer:
          'Có. Phần production tập trung vào VPS, Nginx, SSL, PM2 và các lỗi thực tế khi chạy app.',
      },
    ],
  },
  {
    slug: 'fullstack-nextjs-nestjs',
    title: 'Khóa học Fullstack Next.js/NestJS',
    description:
      'Xây SaaS mini fullstack với Next.js, NestJS, PostgreSQL, auth, dashboard, payment mock, admin panel và deploy.',
    audience: 'Người đã có nền web muốn làm dự án fullstack đủ sâu cho portfolio.',
    level: 'Intermediate → Job-ready',
    duration: '14 tuần',
    primaryKeywords: ['khóa học fullstack', 'học NextJS fullstack', 'học React NodeJS'],
    outcomes: [
      'Hiểu luồng dữ liệu từ UI đến API, database và admin workflow.',
      'Có dự án fullstack deploy thật với auth, dashboard và role-based access.',
      'Biết trình bày kiến trúc, trade-off và bug khó trong phỏng vấn.',
    ],
    modules: [
      {
        title: 'Product architecture',
        description: 'Thiết kế module, route, role, entity và trải nghiệm người dùng.',
        lessons: ['User/admin flow', 'Database entities', 'API contracts', 'UI states'],
      },
      {
        title: 'Build SaaS mini',
        description: 'Next.js frontend, NestJS API, Prisma/PostgreSQL, auth, dashboard và admin.',
        lessons: ['Next App Router', 'NestJS API', 'Auth/CORS/cookie', 'Admin dashboard'],
      },
      {
        title: 'Launch và portfolio',
        description: 'Deploy, monitoring, README, case study và mock interview.',
        lessons: ['VPS deployment', 'SEO metadata', 'Portfolio write-up', 'System interview'],
      },
    ],
    faqs: [
      {
        question: 'Fullstack có quá rộng không?',
        answer:
          'Có nếu học không có lộ trình. Khóa này đi theo một sản phẩm cụ thể để mỗi phần đều có ngữ cảnh.',
      },
      {
        question: 'Dự án cuối khóa có dùng được cho CV không?',
        answer:
          'Có, mục tiêu là tạo một dự án deploy được, có README và case study để kể trong phỏng vấn.',
      },
    ],
  },
  {
    slug: 'ai-machine-learning-ung-dung',
    title: 'Khóa học AI Machine Learning ứng dụng',
    description:
      'Học AI/ML với Python, SQL, mô hình ML cổ điển, evaluation, LLM workflow, RAG cơ bản và dự án portfolio.',
    audience: 'Người muốn chuyển hướng data/AI hoặc build ứng dụng AI thực tế.',
    level: 'Beginner → Intermediate',
    duration: '12 tuần',
    primaryKeywords: ['học AI machine learning', 'khóa học AI online', 'lộ trình học AI'],
    outcomes: [
      'Hiểu quy trình dữ liệu, train/evaluate mô hình và tránh lỗi overfitting/leakage.',
      'Làm dự án AI có metric, demo và phần giải thích quyết định kỹ thuật.',
      'Nắm workflow LLM/RAG cơ bản để ứng dụng vào sản phẩm.',
    ],
    modules: [
      {
        title: 'Data foundation',
        description: 'Python, SQL, cleaning, exploration, metric và storytelling.',
        lessons: ['Python notebook', 'SQL query', 'EDA', 'Metric thinking'],
      },
      {
        title: 'Machine learning',
        description: 'Regression, classification, tree models, clustering và evaluation.',
        lessons: ['Train/test split', 'Feature engineering', 'Model evaluation', 'Error analysis'],
      },
      {
        title: 'AI app workflow',
        description: 'LLM prompt workflow, embedding, RAG, tool use và evaluation.',
        lessons: ['Prompt design', 'RAG basics', 'AI safety', 'Portfolio demo'],
      },
    ],
    faqs: [
      {
        question: 'Khóa AI có cần biết lập trình trước không?',
        answer:
          'Nên có nền Python hoặc sẵn sàng học Python trong giai đoạn đầu. Người mới hoàn toàn vẫn học được nếu đi chậm.',
      },
      {
        question: 'Có cần GPU không?',
        answer:
          'Không cần cho giai đoạn đầu. Khóa ưu tiên dataset vừa, notebook cloud và API model khi cần.',
      },
    ],
  },
];

export const caseStudies: CaseStudy[] = [
  {
    slug: 'nguoi-moi-den-frontend-portfolio',
    title: 'Case study mẫu: từ người mới đến portfolio frontend có thể phỏng vấn',
    description:
      'Một kịch bản học tập cho người mới chuyển sang frontend: roadmap 12 tuần, dự án React, CV ATS và mock interview.',
    persona: 'Người mới biết HTML/CSS cơ bản, muốn xin intern/fresher frontend.',
    problem:
      'Học rời rạc nhiều video nhưng chưa có dự án đủ tốt, CV thiếu keyword và không biết kể dự án khi phỏng vấn.',
    timeline: ['Tuần 1-3: JavaScript và layout nền tảng', 'Tuần 4-8: React + TypeScript + API', 'Tuần 9-12: portfolio, CV, mock interview'],
    approach: [
      'Tạo roadmap theo thời gian học mỗi tuần và role frontend mục tiêu.',
      'Chọn 2 dự án portfolio: dashboard và booking mini app.',
      'Review CV theo JD frontend fresher, bổ sung keyword có bằng chứng.',
      'Mock interview React/JavaScript theo rubric clarity, correctness và depth.',
    ],
    signals: [
      'Có demo deploy và README cho từng dự án.',
      'Trả lời được câu hỏi về state, API, form và responsive.',
      'CV có project bullet rõ công nghệ, tính năng và phần tự làm.',
    ],
    keywords: ['case study học frontend', 'portfolio frontend', 'luyện phỏng vấn frontend'],
    disclaimer:
      'Đây là case study mẫu/mô phỏng theo tình huống học viên thường gặp, không phải cam kết kết quả tuyển dụng.',
    faqs: [
      {
        question: 'Case study này có áp dụng cho người mất gốc không?',
        answer:
          'Có thể, nhưng cần kéo dài giai đoạn nền tảng và giảm tốc độ dự án React để tránh học vẹt.',
      },
      {
        question: 'Có đảm bảo xin được việc không?',
        answer:
          'Không. MentorMind giúp tăng chất lượng lộ trình, portfolio, CV và phỏng vấn, nhưng kết quả còn phụ thuộc thị trường và nỗ lực cá nhân.',
      },
    ],
  },
  {
    slug: 'backend-nodejs-deploy-production',
    title: 'Case study mẫu: học backend NodeJS qua lỗi deploy production',
    description:
      'Kịch bản học backend bằng dự án thật: API NestJS, PostgreSQL, auth, Nginx, SSL, PM2 và debug lỗi pending API.',
    persona: 'Frontend junior muốn mở rộng sang backend/fullstack.',
    problem:
      'Làm được CRUD local nhưng khi deploy gặp lỗi CORS, Nginx, env, SSL, PM2 và không biết debug từ đâu.',
    timeline: ['Tuần 1-2: API foundation', 'Tuần 3-6: database + auth', 'Tuần 7-10: deploy, logging, hardening'],
    approach: [
      'Xây API có auth, refresh token, role guard và admin route.',
      'Dùng Prisma/PostgreSQL với migration, seed data và transaction cơ bản.',
      'Deploy lên VPS, tách web/API bằng subdomain và cấu hình SSL.',
      'Tạo checklist debug DNS → Nginx → process → local curl → browser network.',
    ],
    signals: [
      'API public trả JSON ổn định qua HTTPS.',
      'PM2 restart không mất env/start script.',
      'Ứng viên giải thích được vì sao browser pending hoặc CORS fail.',
    ],
    keywords: ['case study backend NodeJS', 'deploy NestJS VPS', 'học backend production'],
    disclaimer:
      'Đây là case study mẫu/mô phỏng dùng cho mục tiêu học tập, không đại diện cho một khách hàng cụ thể.',
    faqs: [
      {
        question: 'Backend có nên học deploy sớm không?',
        answer:
          'Có, sau khi đã có API cơ bản. Deploy sớm giúp bạn hiểu env, logs, network và lỗi production thật.',
      },
      {
        question: 'Có cần public port 4000 ra ngoài không?',
        answer:
          'Không nhất thiết. Thường Nginx nhận 443 rồi proxy nội bộ về 127.0.0.1:4000 sẽ an toàn và gọn hơn.',
      },
    ],
  },
  {
    slug: 'cv-ats-fresher-it',
    title: 'Case study mẫu: chỉnh CV ATS cho fresher IT có dự án nhưng ít kinh nghiệm',
    description:
      'Kịch bản tối ưu CV fresher IT: keyword theo JD, project bullet, GitHub/portfolio, rủi ro phỏng vấn và roadmap bù kỹ năng.',
    persona: 'Sinh viên/fresher có 2 dự án cá nhân nhưng CV chưa qua vòng lọc.',
    problem:
      'CV liệt kê công nghệ chung chung, bullet point không có bằng chứng, project thiếu link demo và chưa biết giải thích trade-off.',
    timeline: ['Ngày 1: audit CV/JD', 'Ngày 2-4: sửa bullet và README', 'Tuần 2: mock interview theo CV'],
    approach: [
      'So sánh CV với JD mục tiêu để tìm keyword thiếu nhưng phải có bằng chứng thật.',
      'Viết lại project bullet theo hành động, công nghệ, tính năng và kết quả/tín hiệu.',
      'Thêm link demo/GitHub, README và phần mô tả bug khó đã xử lý.',
      'Tạo bộ câu hỏi phỏng vấn dựa trên chính các dòng trong CV.',
    ],
    signals: [
      'CV rõ target role, kỹ năng và dự án liên quan.',
      'Project có demo hoặc README đủ để reviewer kiểm chứng.',
      'Ứng viên trả lời được câu hỏi follow-up từ bullet point.',
    ],
    keywords: ['case study sửa CV ATS', 'CV fresher IT', 'review CV lập trình viên'],
    disclaimer:
      'Đây là case study mẫu/mô phỏng để minh họa quy trình, không phải cam kết tỷ lệ đậu phỏng vấn.',
    faqs: [
      {
        question: 'CV ATS có cần thiết kế đẹp không?',
        answer:
          'Đẹp vừa đủ là tốt, nhưng quan trọng hơn là dễ đọc, đúng keyword, có bằng chứng dự án và không dùng layout gây khó parse.',
      },
      {
        question: 'Có nên đưa tất cả công nghệ từng học vào CV không?',
        answer:
          'Không. Chỉ nên đưa công nghệ liên quan role mục tiêu và bạn có thể trả lời khi bị hỏi sâu.',
      },
    ],
  },
];

export const faqGroups: FaqGroup[] = [
  {
    title: 'Học lập trình online',
    description: 'Những câu hỏi thường gặp khi bắt đầu học lập trình theo lộ trình online.',
    items: [
      {
        question: 'MentorMind khác gì khóa học video thông thường?',
        answer:
          'MentorMind kết hợp roadmap cá nhân hóa, mentor 1-1, bài tập, luyện code, phỏng vấn AI, CV review và dashboard tiến độ thay vì chỉ xem video.',
      },
      {
        question: 'Tôi chưa biết bắt đầu từ frontend hay backend thì sao?',
        answer:
          'Bạn nên tạo roadmap trước. Hệ thống sẽ hỏi mục tiêu, trình độ, thời gian học và đề xuất hướng đi phù hợp.',
      },
      {
        question: 'Học online có cần lịch cố định không?',
        answer:
          'Nên có lịch cố định để tạo nhịp học. Với mentor 1-1, lịch học và bài tập được quản lý theo tài khoản.',
      },
    ],
  },
  {
    title: 'Mentor 1-1 và gói học',
    description: 'Cách chọn gói học, mentor và lộ trình theo mục tiêu nghề nghiệp.',
    items: [
      {
        question: 'Gói mentor 1-1 gồm những gì?',
        answer:
          'Tùy gói, học viên có thể có roadmap, buổi mentor, bài tập, review code, review CV, mock interview và hỗ trợ AI.',
      },
      {
        question: 'Có thể đổi hướng học giữa chừng không?',
        answer:
          'Có. Khi mục tiêu thay đổi, mentor hoặc admin có thể điều chỉnh roadmap, bài tập và tài nguyên liên quan.',
      },
      {
        question: 'Tôi nên chọn gói tháng hay gói dài hạn?',
        answer:
          'Nếu mới thử, gói tháng giúp kiểm tra nhịp học. Nếu đã xác định mục tiêu dài hạn, gói dài hạn thường tiết kiệm và ổn định hơn.',
      },
    ],
  },
  {
    title: 'Luyện code, phỏng vấn và CV',
    description: 'Câu hỏi về luyện tập đi làm: code, phỏng vấn, portfolio và CV ATS.',
    items: [
      {
        question: 'AI có làm bài code hộ tôi không?',
        answer:
          'Mục tiêu là gợi ý đúng mức để bạn học được. Bạn có thể yêu cầu hint, phân tích lỗi hoặc giải thích hướng làm thay vì copy lời giải.',
      },
      {
        question: 'Mock interview AI có thay mentor thật không?',
        answer:
          'Không hoàn toàn. AI giúp luyện nhiều và phản hồi nhanh, còn mentor thật giúp chỉnh chiến lược, chiều sâu dự án và định hướng nghề nghiệp.',
      },
      {
        question: 'Review CV ATS có cần JD không?',
        answer:
          'Không bắt buộc, nhưng có JD sẽ giúp so sánh keyword, kỹ năng và rủi ro phỏng vấn chính xác hơn.',
      },
    ],
  },
  {
    title: 'Tài khoản, dữ liệu và triển khai',
    description: 'Các câu hỏi về tài khoản, dữ liệu học tập và trải nghiệm sản phẩm.',
    items: [
      {
        question: 'Dữ liệu học tập được lưu theo tài khoản như thế nào?',
        answer:
          'Dashboard gom roadmap, lịch học, bài code, phỏng vấn, CV, tài nguyên và thông báo theo tài khoản để AI gợi ý đúng ngữ cảnh.',
      },
      {
        question: 'Admin có chỉnh được gói học và nội dung không?',
        answer:
          'Có. Trang admin hỗ trợ quản lý gói học, người dùng, mentor, tài nguyên, câu hỏi phỏng vấn, bài code, thanh toán và cấu hình AI.',
      },
      {
        question: 'Website có hỗ trợ SEO và Search Console không?',
        answer:
          'Có. Website có sitemap, robots, metadata, schema, landing pages, blog, khóa học, case study và OG image cho các trang SEO.',
      },
    ],
  },
];

export function findArticle(slug: string) {
  return blogArticles.find((article) => article.slug === slug);
}

export function findCourse(slug: string) {
  return seoCourses.find((course) => course.slug === slug);
}

export function findCaseStudy(slug: string) {
  return caseStudies.find((caseStudy) => caseStudy.slug === slug);
}
