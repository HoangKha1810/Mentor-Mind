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

export const featuredPackages: PublicTutoringPackage[] = [
  {
    id: 'frontend-intern',
    title: 'Lộ trình Frontend Intern 1-1',
    slug: 'frontend-intern-1-on-1-roadmap',
    shortDescription: 'Từ nền tảng HTML/CSS/JS đến portfolio React và sẵn sàng phỏng vấn thực tập.',
    category: 'FRONTEND',
    targetRole: 'Frontend Intern',
    level: 'FOUNDATION',
    durationWeeks: 12,
    recommendedSessions: 24,
    price: 699,
    currency: 'USD',
    featured: true,
    skills: ['JavaScript', 'React', 'CSS', 'Git', 'Portfolio'],
    includedAiTools: ['Lộ trình AI', 'Luyện code', 'Phỏng vấn AI', 'Sửa CV'],
  },
  {
    id: 'backend-foundation',
    title: 'Lộ trình Backend nền tảng 1-1',
    slug: 'backend-foundation-1-on-1-roadmap',
    shortDescription: 'Xây nền tảng API thực chiến với Node.js, SQL, auth, testing và triển khai.',
    category: 'BACKEND',
    targetRole: 'Backend Developer',
    level: 'FOUNDATION',
    durationWeeks: 14,
    recommendedSessions: 28,
    price: 799,
    currency: 'USD',
    featured: true,
    skills: ['Node.js', 'PostgreSQL', 'REST', 'Auth', 'Testing'],
    includedAiTools: ['Lộ trình AI', 'Đánh giá code', 'Tìm tài nguyên'],
  },
  {
    id: 'coding-interview',
    title: 'Bootcamp phỏng vấn thuật toán',
    slug: 'coding-interview-bootcamp',
    shortDescription:
      'Luyện tập có cấu trúc, phỏng vấn thử, vòng phản hồi và tư duy giải bài sẵn sàng đi làm.',
    category: 'CAREER',
    targetRole: 'Software Engineer',
    level: 'JOB_READY',
    durationWeeks: 8,
    recommendedSessions: 16,
    price: 899,
    currency: 'USD',
    featured: true,
    skills: ['Thuật toán', 'Cấu trúc dữ liệu', 'Giao tiếp', 'Debugging'],
    includedAiTools: ['Phỏng vấn AI', 'Luyện code', 'Gợi ý AI', 'Đánh giá code AI'],
  },
];

export const codingLanguageOptions = [
  {
    label: 'JavaScript',
    value: 'JAVASCRIPT',
    judge0Id: 63,
    editorLanguage: 'javascript',
    fileName: 'main.js',
  },
  {
    label: 'TypeScript',
    value: 'TYPESCRIPT',
    judge0Id: 74,
    editorLanguage: 'typescript',
    fileName: 'main.ts',
  },
  {
    label: 'Python',
    value: 'PYTHON',
    judge0Id: 71,
    editorLanguage: 'python',
    fileName: 'main.py',
  },
  {
    label: 'Java',
    value: 'JAVA',
    judge0Id: 62,
    editorLanguage: 'java',
    fileName: 'Main.java',
  },
  {
    label: 'C++',
    value: 'CPP',
    judge0Id: 54,
    editorLanguage: 'cpp',
    fileName: 'main.cpp',
  },
] as const;

export type CodingLanguage = (typeof codingLanguageOptions)[number]['value'];

export const codingLanguageStarterCode = {
  JAVASCRIPT: `const fs = require('fs');

function solve(input) {
  // Viết lời giải ở đây. Trả về chuỗi kết quả cuối cùng.
  return '';
}

process.stdout.write(String(solve(fs.readFileSync(0, 'utf8'))));`,
  TYPESCRIPT: `declare function require(name: string): any;
declare const process: { stdout: { write(value: string): void } };

const fs = require('fs');

function solve(input: string): string {
  // Viết lời giải ở đây. Trả về chuỗi kết quả cuối cùng.
  return '';
}

process.stdout.write(String(solve(fs.readFileSync(0, 'utf8'))));`,
  PYTHON: `import sys

def solve(data: str) -> str:
    # Viết lời giải ở đây. Trả về chuỗi kết quả cuối cùng.
    return ""

if __name__ == "__main__":
    sys.stdout.write(str(solve(sys.stdin.read())))`,
  JAVA: `import java.nio.charset.StandardCharsets;

public class Main {
    static String solve(String input) {
        // Viết lời giải ở đây. Trả về chuỗi kết quả cuối cùng.
        return "";
    }

    public static void main(String[] args) throws Exception {
        String input = new String(System.in.readAllBytes(), StandardCharsets.UTF_8);
        System.out.print(solve(input));
    }
}`,
  CPP: `#include <iostream>
#include <sstream>
#include <string>

using namespace std;

string solve(const string& input) {
    // Viết lời giải ở đây. Trả về chuỗi kết quả cuối cùng.
    return "";
}

int main() {
    ostringstream buffer;
    buffer << cin.rdbuf();
    cout << solve(buffer.str());
    return 0;
}`,
} as const satisfies Record<CodingLanguage, string>;

export type CurrencyAmount =
  | number
  | string
  | {
      s?: number;
      e?: number;
      d?: number[];
      toString?: () => string;
    };

export const toCurrencyNumber = (amount: CurrencyAmount | null | undefined, fallback = 0) => {
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : fallback;
  if (typeof amount === 'string') {
    const parsed = Number(amount.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (!amount || typeof amount !== 'object') return fallback;

  if (Array.isArray(amount.d) && amount.d.length > 0) {
    const digits = amount.d
      .map((chunk, index) => (index === 0 ? String(chunk) : String(chunk).padStart(7, '0')))
      .join('');
    const integerLength = typeof amount.e === 'number' ? amount.e + 1 : digits.length;
    const normalized =
      integerLength <= 0
        ? `0.${'0'.repeat(Math.abs(integerLength))}${digits}`
        : integerLength >= digits.length
          ? `${digits}${'0'.repeat(integerLength - digits.length)}`
          : `${digits.slice(0, integerLength)}.${digits.slice(integerLength)}`;
    const parsed = Number(`${amount.s === -1 ? '-' : ''}${normalized}`);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const parsed = Number(amount.toString?.());
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const formatCurrency = (amount: CurrencyAmount | null | undefined, currency = 'USD') =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(toCurrencyNumber(amount));

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export type SampleRoadmapTemplate = {
  slug: string;
  title: string;
  summary: string;
  sourceFile: string;
  category: PackageCategory;
  targetRole: string;
  level: PackageLevel;
  durationWeeks: number;
  weeklyHours: number;
  outcomes: string[];
  lessons: Array<{
    title: string;
    objective: string;
    practice: string;
    output: string;
  }>;
};

export const sampleRoadmapTemplates: SampleRoadmapTemplate[] = [
  {
    slug: 'chatbot-thuong-mai-5-ngay',
    title: 'Chatbot thương mại: viết bài báo trong 5 ngày',
    summary:
      'Lộ trình ngắn để xác định đề tài, xây cơ sở lý thuyết, thiết kế mô hình chatbot thương mại, thực nghiệm và hoàn thiện bài báo.',
    sourceFile: 'Đề cương 5 ngày Chatbot thương mại.xlsx',
    category: 'AI_ML',
    targetRole: 'AI Research Intern',
    level: 'FOUNDATION',
    durationWeeks: 1,
    weeklyHours: 12,
    outcomes: ['Đề tài nghiên cứu rõ ràng', 'Mô hình chatbot đề xuất', 'Bản thảo bài báo hoàn chỉnh'],
    lessons: [
      {
        title: 'Ngày 1: Xác định đề tài và tổng quan nghiên cứu',
        objective: 'Chốt vấn đề nghiên cứu, phạm vi ứng dụng thương mại và câu hỏi nghiên cứu.',
        practice: 'Phân tích 3-5 chatbot thương mại và ghi lại hạn chế, cơ hội cải tiến.',
        output: 'Đề cương vấn đề, mục tiêu, phạm vi và đóng góp dự kiến.',
      },
      {
        title: 'Ngày 2: Cơ sở lý thuyết và tổng quan tài liệu',
        objective: 'Tổng hợp nền tảng chatbot, NLP, LLM, RAG và các tiêu chí đánh giá.',
        practice: 'Tạo bảng so sánh tài liệu liên quan và khoảng trống nghiên cứu.',
        output: 'Phần related work và theoretical background bản nháp.',
      },
      {
        title: 'Ngày 3: Phương pháp nghiên cứu và mô hình đề xuất',
        objective: 'Thiết kế kiến trúc chatbot, dữ liệu, pipeline và tiêu chí thử nghiệm.',
        practice: 'Vẽ luồng xử lý dữ liệu, prompt, truy hồi và phản hồi người dùng.',
        output: 'Sơ đồ mô hình và phần methodology.',
      },
      {
        title: 'Ngày 4: Thực nghiệm và đánh giá',
        objective: 'Chạy thử mô hình, thu thập kết quả và đánh giá bằng tiêu chí định lượng/định tính.',
        practice: 'Tạo bảng kết quả, phân tích lỗi và so sánh với baseline.',
        output: 'Phần experiment, result và discussion.',
      },
      {
        title: 'Ngày 5: Kết luận và hoàn thiện bài báo',
        objective: 'Hoàn thiện kết luận, đóng góp, hạn chế và hướng phát triển.',
        practice: 'Rà format, citation, abstract, keyword và checklist nộp bài.',
        output: 'Bản thảo bài báo hoàn chỉnh.',
      },
    ],
  },
  {
    slug: 'ung-dung-ai-chatbot-10-buoi',
    title: 'Ứng dụng AI vào Chatbot trong 10 buổi',
    summary:
      'Lộ trình xây chatbot AI từ Python/API, prompt engineering, embedding, RAG, LangChain/LlamaIndex đến deploy sản phẩm và đồ án cuối khóa.',
    sourceFile: 'Đề cương 10 buổi ChatBot AI.xlsx',
    category: 'AI_ML',
    targetRole: 'AI Chatbot Developer',
    level: 'INTERMEDIATE',
    durationWeeks: 5,
    weeklyHours: 8,
    outcomes: ['Chatbot AI dùng dữ liệu riêng', 'Pipeline RAG có đánh giá', 'Đồ án chatbot có thể demo'],
    lessons: [
      {
        title: 'Buổi 1: Tổng quan ChatBot AI và các mô hình chatbot',
        objective: 'Hiểu chatbot rule-based, retrieval, generative và vai trò của LLM.',
        practice: 'Phân tích use case chatbot cho một doanh nghiệp nhỏ.',
        output: 'Bản đặc tả use case và personas người dùng.',
      },
      {
        title: 'Buổi 2: Python, API cơ bản và chatbot đầu tiên',
        objective: 'Kết nối API LLM và dựng chatbot tối giản.',
        practice: 'Viết endpoint gửi/nhận hội thoại.',
        output: 'Prototype chatbot text chạy local.',
      },
      {
        title: 'Buổi 3: LLM cơ bản và Prompt Engineering',
        objective: 'Thiết kế system prompt, few-shot, guardrail và format output.',
        practice: 'Tạo bộ prompt cho chăm sóc khách hàng.',
        output: 'Prompt library phiên bản 1.',
      },
      {
        title: 'Buổi 4: Các mô hình ChatBot cho nghiên cứu khoa học',
        objective: 'So sánh mô hình và phương pháp dùng chatbot trong nghiên cứu.',
        practice: 'Đọc, tóm tắt và so sánh 3 bài liên quan.',
        output: 'Bảng so sánh mô hình chatbot.',
      },
      {
        title: 'Buổi 5: Embedding, semantic search và vector database',
        objective: 'Hiểu embedding, similarity search và index vector.',
        practice: 'Tạo index tài liệu nhỏ và truy hồi top-k.',
        output: 'Demo semantic search.',
      },
      {
        title: 'Buổi 6: RAG dùng dữ liệu riêng',
        objective: 'Kết hợp retrieval với generation và citation.',
        practice: 'Xây pipeline chunk, embed, retrieve, answer.',
        output: 'Chatbot RAG trả lời theo tài liệu riêng.',
      },
      {
        title: 'Buổi 7: LangChain/LlamaIndex để tổ chức pipeline',
        objective: 'Tổ chức chain, retriever, prompt và memory có cấu trúc.',
        practice: 'Refactor pipeline RAG thành module rõ ràng.',
        output: 'Codebase chatbot dễ bảo trì.',
      },
      {
        title: 'Buổi 8: Đánh giá chatbot và thiết kế thí nghiệm',
        objective: 'Xây benchmark câu hỏi, tiêu chí đúng/sai, groundedness và latency.',
        practice: 'Tạo bộ test 20 câu và báo cáo kết quả.',
        output: 'Bảng đánh giá chatbot.',
      },
      {
        title: 'Buổi 9: Deploy chatbot thành sản phẩm web/app',
        objective: 'Triển khai API, giao diện chat, logging và bảo mật cơ bản.',
        practice: 'Deploy phiên bản MVP có env production.',
        output: 'Link demo chatbot.',
      },
      {
        title: 'Buổi 10: Đồ án cuối khóa và đề cương bài báo',
        objective: 'Hoàn thiện sản phẩm, demo và đóng gói đề cương nghiên cứu.',
        practice: 'Trình bày demo, nhận phản biện và sửa backlog.',
        output: 'Đồ án chatbot và đề cương bài báo.',
      },
    ],
  },
  {
    slug: 'rag-phap-luat-5-buoi',
    title: 'Chatbot AI + RAG cho nghiên cứu tài liệu pháp luật',
    summary:
      'Lộ trình 5 buổi để xây chatbot hỏi đáp tài liệu pháp luật, tập trung prompt, context, RAG, đánh giá và triển khai thực tế.',
    sourceFile: 'Đề cương AI 5 buổi.xlsx',
    category: 'AI_ML',
    targetRole: 'RAG Engineer',
    level: 'FOUNDATION',
    durationWeeks: 3,
    weeklyHours: 6,
    outcomes: ['Chatbot pháp luật dùng RAG', 'Bộ dữ liệu tài liệu được xử lý', 'Quy trình đánh giá câu trả lời'],
    lessons: [
      {
        title: 'Buổi 1: Tổng quan AI Chatbot và LLM',
        objective: 'Hiểu cách LLM tạo câu trả lời và giới hạn khi xử lý tài liệu pháp luật.',
        practice: 'Xác định phạm vi câu hỏi, nguồn dữ liệu và rủi ro hallucination.',
        output: 'Bản mô tả phạm vi chatbot pháp luật.',
      },
      {
        title: 'Buổi 2: Prompt Engineering và Context',
        objective: 'Thiết kế prompt yêu cầu trích dẫn, không bịa và hỏi lại khi thiếu dữ kiện.',
        practice: 'Tạo prompt cho 5 tình huống hỏi đáp pháp luật.',
        output: 'Prompt chuẩn cho legal assistant.',
      },
      {
        title: 'Buổi 3: RAG',
        objective: 'Thiết kế chunking, embedding, retrieval và context injection.',
        practice: 'Index một bộ văn bản pháp luật nhỏ.',
        output: 'Pipeline RAG có truy hồi tài liệu.',
      },
      {
        title: 'Buổi 4: Xây dựng Chatbot pháp luật với RAG',
        objective: 'Kết nối pipeline với giao diện chat và log câu hỏi/câu trả lời.',
        practice: 'Tạo demo hỏi đáp có citation.',
        output: 'Chatbot pháp luật MVP.',
      },
      {
        title: 'Buổi 5: Nâng cao, đánh giá và triển khai thực tế',
        objective: 'Đánh giá độ đúng, coverage, latency và chuẩn bị deploy.',
        practice: 'Chạy bộ test, phân tích lỗi và lập checklist production.',
        output: 'Báo cáo đánh giá và kế hoạch triển khai.',
      },
    ],
  },
  {
    slug: 'ai-engineer-20-buoi',
    title: 'AI Engineer 20 buổi: LLM, RAG, Multimodal và Agent',
    summary:
      'Lộ trình dài hạn từ Python/API LLM, Transformers, RAG nâng cao, fine-tuning, text-to-image, vision-language, agent đến triển khai MVP.',
    sourceFile: 'Đề cương AI 20 buổi.xlsx',
    category: 'AI_ML',
    targetRole: 'AI Engineer',
    level: 'ADVANCED',
    durationWeeks: 10,
    weeklyHours: 10,
    outcomes: ['Nắm vững pipeline LLM/RAG', 'Xây được sản phẩm AI đa phương thức', 'Có MVP và demo cuối khóa'],
    lessons: [
      {
        title: 'Buổi 1: Tổng quan AI, GenAI, LLM và định hướng dự án',
        objective: 'Chọn bài toán thực tế và kiến trúc AI phù hợp.',
        practice: 'Phân tích use case, dữ liệu, rủi ro và metric.',
        output: 'Đề cương dự án AI cá nhân.',
      },
      {
        title: 'Buổi 2: Python, môi trường làm việc và API LLM',
        objective: 'Thiết lập môi trường, gọi API và quản lý khóa bảo mật.',
        practice: 'Viết service gọi LLM có logging.',
        output: 'API LLM wrapper.',
      },
      {
        title: 'Buổi 3: Prompt Engineering và thiết kế hành vi chatbot',
        objective: 'Thiết kế vai trò, format, guardrail và memory cơ bản.',
        practice: 'Tạo prompt set cho assistant theo domain.',
        output: 'Prompt system hoàn chỉnh.',
      },
      {
        title: 'Buổi 4: Transformers nền tảng',
        objective: 'Hiểu token, attention, encoder/decoder và giới hạn context.',
        practice: 'Minh họa attention và tokenization.',
        output: 'Notebook giải thích transformer.',
      },
      {
        title: 'Buổi 5: Các mô hình chatbot hiện đại',
        objective: 'So sánh LLM API, open-source model và tiêu chí chọn model.',
        practice: 'Benchmark nhanh 2-3 model theo cùng prompt.',
        output: 'Bảng chọn model cho dự án.',
      },
      {
        title: 'Buổi 6: Embedding, Semantic Search và Vector Database',
        objective: 'Xây nền tảng search theo ngữ nghĩa.',
        practice: 'Tạo vector index và truy vấn top-k.',
        output: 'Semantic search service.',
      },
      {
        title: 'Buổi 7: RAG cơ bản',
        objective: 'Kết hợp dữ liệu riêng vào câu trả lời LLM.',
        practice: 'Xây pipeline chunk, embed, retrieve, answer.',
        output: 'RAG MVP.',
      },
      {
        title: 'Buổi 8: Xử lý dữ liệu cho RAG',
        objective: 'Làm sạch PDF, bảng, scan OCR và dữ liệu bẩn.',
        practice: 'Chuẩn hóa tài liệu thật thành chunk có metadata.',
        output: 'Dataset RAG sạch.',
      },
      {
        title: 'Buổi 9: Hybrid Search, Re-ranking và Query Expansion',
        objective: 'Cải thiện recall và precision của retrieval.',
        practice: 'Kết hợp keyword search, vector search và reranker.',
        output: 'Retriever nâng cao.',
      },
      {
        title: 'Buổi 10: Parent/Child, Context Compression, Citation và Memory',
        objective: 'Tối ưu context đưa vào LLM và trích dẫn đáng tin cậy.',
        practice: 'Thêm citation và compression cho RAG.',
        output: 'RAG có citation rõ ràng.',
      },
      {
        title: 'Buổi 11: Đánh giá Chatbot/RAG và benchmark',
        objective: 'Thiết kế bộ test cho faithfulness, relevance, latency và cost.',
        practice: 'Chạy benchmark và viết báo cáo lỗi.',
        output: 'Dashboard đánh giá RAG.',
      },
      {
        title: 'Buổi 12: Fine-tuning LLM',
        objective: 'Hiểu LoRA, QLoRA, PEFT và chuẩn bị dữ liệu huấn luyện.',
        practice: 'Thiết kế dataset instruction nhỏ.',
        output: 'Kế hoạch fine-tuning.',
      },
      {
        title: 'Buổi 13: GANs, Diffusion và nền tảng Text2Image',
        objective: 'Hiểu cách mô hình ảnh sinh hoạt động.',
        practice: 'So sánh prompt ảnh và tham số sinh ảnh.',
        output: 'Bộ prompt text-to-image.',
      },
      {
        title: 'Buổi 14: Stable Diffusion, ControlNet, LoRA và ComfyUI',
        objective: 'Tạo workflow ảnh có kiểm soát.',
        practice: 'Dựng workflow sinh ảnh theo yêu cầu.',
        output: 'ComfyUI workflow mẫu.',
      },
      {
        title: 'Buổi 15: Image2Text, OCR và Vision-Language Models',
        objective: 'Trích xuất thông tin từ ảnh/tài liệu.',
        practice: 'OCR và hỏi đáp trên ảnh tài liệu.',
        output: 'Demo vision QA.',
      },
      {
        title: 'Buổi 16: Multimodal RAG',
        objective: 'Kết hợp văn bản, ảnh, OCR và chatbot.',
        practice: 'Index tài liệu có ảnh và bảng.',
        output: 'Multimodal RAG prototype.',
      },
      {
        title: 'Buổi 17: AI Agent, Tool Calling, LangChain/LlamaIndex và MCP',
        objective: 'Thiết kế agent gọi công cụ có kiểm soát.',
        practice: 'Tạo agent dùng search/tool nội bộ.',
        output: 'Agent workflow.',
      },
      {
        title: 'Buổi 18: Triển khai sản phẩm',
        objective: 'Đóng gói FastAPI, Docker, logging, security và monitoring.',
        practice: 'Deploy MVP với env production.',
        output: 'AI service chạy production.',
      },
      {
        title: 'Buổi 19: Sprint đồ án thực tế',
        objective: 'Hoàn thiện MVP, xử lý lỗi và cải thiện UX.',
        practice: 'Fix backlog theo phản hồi mentor.',
        output: 'MVP sẵn sàng demo.',
      },
      {
        title: 'Buổi 20: Demo cuối khóa và hướng phát triển',
        objective: 'Trình bày sản phẩm, phản biện kỹ thuật và lập roadmap tiếp theo.',
        practice: 'Demo, nhận phản hồi, viết postmortem.',
        output: 'Demo cuối khóa và kế hoạch nâng cấp.',
      },
    ],
  },
  {
    slug: 'xay-goc-lap-trinh-ai',
    title: 'Xây gốc lập trình AI: ML, Deep Learning và dự án cuối khóa',
    summary:
      'Lộ trình nền tảng từ machine learning, regression, SVM, ensemble, deep learning, CNN/RNN/Transformer, vector database đến dự án YOLO/Object Detection.',
    sourceFile: 'Xây gốc lập trình AI.xlsx',
    category: 'AI_ML',
    targetRole: 'Machine Learning Engineer',
    level: 'FOUNDATION',
    durationWeeks: 10,
    weeklyHours: 8,
    outcomes: ['Nắm nền tảng ML/DL', 'Biết đánh giá và tuning mô hình', 'Có dự án computer vision cuối khóa'],
    lessons: [
      {
        title: 'ML nền tảng và các kiểu học',
        objective: 'Hiểu supervised, unsupervised, reinforcement learning và quy trình ML.',
        practice: 'Phân loại bài toán thực tế theo kiểu học.',
        output: 'Bản đồ tư duy ML fundamentals.',
      },
      {
        title: 'Linear Regression và Gradient Descent',
        objective: 'Hiểu loss, gradient và quá trình tối ưu.',
        practice: 'Huấn luyện linear regression từ dữ liệu mẫu.',
        output: 'Notebook regression.',
      },
      {
        title: 'Logistic Regression',
        objective: 'Nắm bài toán phân loại nhị phân và metric cơ bản.',
        practice: 'Train classifier và đọc confusion matrix.',
        output: 'Mô hình classification đầu tiên.',
      },
      {
        title: 'SVM, KMeans và KNN',
        objective: 'So sánh margin, clustering và nearest neighbors.',
        practice: 'Chạy thử SVM/KMeans/KNN trên dataset nhỏ.',
        output: 'Bảng so sánh mô hình cổ điển.',
      },
      {
        title: 'Regularization và Feature Engineering',
        objective: 'Giảm overfit và cải thiện đặc trưng đầu vào.',
        practice: 'Thử L1/L2, scaling và feature transform.',
        output: 'Pipeline preprocessing.',
      },
      {
        title: 'Decision Tree, Random Forest và Boosting',
        objective: 'Hiểu cây quyết định và ensemble learning.',
        practice: 'Train Random Forest/Gradient Boosting và đọc feature importance.',
        output: 'Model ensemble có đánh giá.',
      },
      {
        title: 'Cross Validation và Hyperparameter Tuning',
        objective: 'Đánh giá mô hình ổn định và tìm tham số tốt hơn.',
        practice: 'Chạy cross validation và grid/random search.',
        output: 'Báo cáo tuning.',
      },
      {
        title: 'Deep Learning Fundamentals',
        objective: 'Hiểu neuron, layer, activation, optimizer và backprop.',
        practice: 'Train neural network nhỏ.',
        output: 'Notebook deep learning cơ bản.',
      },
      {
        title: 'CNN, Advanced CNN và Finetune',
        objective: 'Xử lý ảnh bằng convolution và transfer learning.',
        practice: 'Finetune model image classification.',
        output: 'Demo phân loại ảnh.',
      },
      {
        title: 'RNN, LSTM, GRU và NLP',
        objective: 'Hiểu sequence modeling cho văn bản.',
        practice: 'Train model phân loại câu đơn giản.',
        output: 'NLP sequence prototype.',
      },
      {
        title: 'Vision Transformer và VQA',
        objective: 'Khám phá transformer cho ảnh và hỏi đáp trực quan.',
        practice: 'Thử pipeline VQA trên ảnh mẫu.',
        output: 'Demo VQA.',
      },
      {
        title: 'Vector Database',
        objective: 'Lưu và truy vấn embedding cho tìm kiếm thông minh.',
        practice: 'Tạo index vector cho ảnh hoặc text.',
        output: 'Vector search demo.',
      },
      {
        title: 'Dự án cuối khóa YOLO/Object Detection/Recognition',
        objective: 'Hoàn thiện dự án nhận diện đối tượng thực tế.',
        practice: 'Chuẩn bị data, train/fine-tune, đánh giá và demo.',
        output: 'Dự án object detection cuối khóa.',
      },
    ],
  },
];
