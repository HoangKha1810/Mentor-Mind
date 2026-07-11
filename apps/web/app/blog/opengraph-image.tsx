import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="Blog MentorMind"
        title="Blog học lập trình, AI, CV và phỏng vấn IT"
        description="Roadmap, frontend, backend, ReactJS, NodeJS, AI/ML, CV ATS, portfolio và deploy production."
        chips={['Blog học lập trình', 'Frontend', 'Backend', 'CV ATS']}
        tone="violet"
      />
    ),
    size,
  );
}
