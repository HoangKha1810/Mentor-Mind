import { ImageResponse } from 'next/og';
import { caseStudies, findCaseStudy } from '@/lib/seo-growth-content';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return caseStudies.map((item) => ({ slug: item.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const item = findCaseStudy(params.slug) ?? caseStudies[0]!;

  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow="Case study mẫu"
        title={item.title}
        description={item.description}
        chips={item.keywords.slice(0, 4)}
        tone="emerald"
      />
    ),
    size,
  );
}
