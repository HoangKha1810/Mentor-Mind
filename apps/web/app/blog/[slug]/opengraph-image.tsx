import { ImageResponse } from 'next/og';
import { findArticle, blogArticles } from '@/lib/seo-growth-content';
import { MentorMindOgImage, ogSize } from '@/lib/og-image';

export const size = ogSize;
export const contentType = 'image/png';

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = findArticle(params.slug) ?? blogArticles[0]!;

  return new ImageResponse(
    (
      <MentorMindOgImage
        eyebrow={article.category}
        title={article.title}
        description={article.description}
        chips={[article.keyword, `${article.readMinutes} phút đọc`, ...article.related.slice(0, 2)]}
        tone={article.tone}
      />
    ),
    size,
  );
}
