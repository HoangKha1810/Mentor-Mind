import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="Case study MentorMind"
        title="Case study học lập trình, CV và phỏng vấn IT"
        description="Kịch bản học tập có roadmap, approach, tín hiệu đo tiến bộ và FAQ minh bạch."
        chips={['Case study mẫu', 'Portfolio', 'CV ATS', 'Mock interview']}
        tone="emerald"
      />
    ),
    size,
  );
}
