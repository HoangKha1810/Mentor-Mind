import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="Học lập trình online"
        title="MentorMind - Lộ trình AI, mentor 1-1 và học để đi làm"
        description="Roadmap cá nhân hóa, luyện code, phỏng vấn AI, sửa CV ATS và tài nguyên học tập cho người Việt."
        chips={['Học lập trình online', 'Mentor 1-1', 'AI roadmap', 'Job-ready']}
        tone="cyan"
      />
    ),
    size,
  );
}
