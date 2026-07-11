import { ImageResponse } from 'next/og';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';
import { seoLandingPages } from '@/lib/seo-content';

export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return seoLandingPages.map((page) => ({ slug: page.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const page = seoLandingPages.find((item) => item.slug === params.slug) ?? seoLandingPages[0]!;

  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        chips={page.keywords.slice(0, 4)}
        tone="cyan"
      />
    ),
    size,
  );
}
