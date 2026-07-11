import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="FAQ MentorMind"
        title="Câu hỏi thường gặp về học lập trình online, mentor, CV và AI"
        description="FAQ thật theo nhu cầu học, mentor 1-1, luyện code, phỏng vấn AI, sửa CV ATS và tài khoản."
        chips={['FAQ schema', 'Mentor 1-1', 'CV ATS', 'AI roadmap']}
        tone="orange"
      />
    ),
    size,
  );
}
