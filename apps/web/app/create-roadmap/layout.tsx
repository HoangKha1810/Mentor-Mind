import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo lộ trình học cá nhân hóa với AI',
  description:
    'Tạo lộ trình học lập trình cá nhân hóa theo mục tiêu nghề nghiệp, trình độ hiện tại, lịch học và kỹ năng cần cải thiện.',
  alternates: { canonical: '/create-roadmap' },
  openGraph: {
    title: 'Tạo lộ trình học cá nhân hóa với AI',
    description:
      'Biến mục tiêu nghề nghiệp thành lộ trình học có bài tập, dự án, luyện code và phỏng vấn.',
    url: '/create-roadmap',
  },
};

export default function CreateRoadmapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
