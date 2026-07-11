import { ImageResponse } from 'next/og';
import { findCourse, seoCourses } from '@/lib/seo-growth-content';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return seoCourses.map((course) => ({ slug: course.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const course = findCourse(params.slug) ?? seoCourses[0]!;

  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow={course.level}
        title={course.title}
        description={course.description}
        chips={[course.duration, ...course.primaryKeywords.slice(0, 3)]}
        tone="blue"
      />
    ),
    size,
  );
}
