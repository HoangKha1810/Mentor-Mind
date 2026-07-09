const packageCategoryLabels: Record<string, string> = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  FULLSTACK: 'Full-stack',
  AI_ML: 'AI/ML',
  DATA: 'Dữ liệu',
  MOBILE: 'Mobile',
  CAREER: 'Sự nghiệp',
  ENGLISH_INTERVIEW: 'Phỏng vấn tiếng Anh',
  OTHER: 'Khác',
};

const packageLevelLabels: Record<string, string> = {
  BEGINNER: 'Người mới',
  FOUNDATION: 'Nền tảng',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
  JOB_READY: 'Sẵn sàng đi làm',
};

export function packageCategoryLabel(value: string) {
  return packageCategoryLabels[value] ?? value;
}

export function packageLevelLabel(value: string) {
  return packageLevelLabels[value] ?? value;
}
