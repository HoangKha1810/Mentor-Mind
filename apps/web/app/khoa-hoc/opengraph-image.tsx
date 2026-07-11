import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="Khóa học MentorMind"
        title="Khóa học lập trình online theo mục tiêu đi làm"
        description="Frontend React, Backend NodeJS/NestJS, Fullstack Next.js/NestJS và AI Machine Learning ứng dụng."
        chips={['Frontend React', 'Backend NodeJS', 'Fullstack', 'AI/ML']}
        tone="blue"
      />
    ),
    size,
  );
}
