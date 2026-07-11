import type { MetadataRoute } from 'next';
import { blogArticles, caseStudies, seoCourses } from '@/lib/seo-growth-content';
import { seoLandingPages, siteIndexingEnabled, siteUrl } from '@/lib/seo-content';
import { listPublishedPackages } from '@/lib/public-packages';

export const revalidate = 60;

type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  lastModified?: string;
};

const routes: SitemapEntry[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/packages', priority: 0.9, changeFrequency: 'daily' },
  { path: '/pricing', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/create-roadmap', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/code-practice', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ai-interview', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/resources', priority: 0.8, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.86, changeFrequency: 'weekly' },
  { path: '/khoa-hoc', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/case-studies', priority: 0.76, changeFrequency: 'monthly' },
  { path: '/cau-hoi-thuong-gap', priority: 0.82, changeFrequency: 'monthly' },
  { path: '/media-kit', priority: 0.62, changeFrequency: 'monthly' },
  ...seoLandingPages.map((page) => ({
    path: `/${page.slug}`,
    priority: 0.78,
    changeFrequency: 'monthly' as const,
  })),
  ...blogArticles.map((article) => ({
    path: `/blog/${article.slug}`,
    priority: 0.74,
    changeFrequency: 'monthly' as const,
    lastModified: article.updatedAt,
  })),
  ...seoCourses.map((course) => ({
    path: `/khoa-hoc/${course.slug}`,
    priority: 0.82,
    changeFrequency: 'monthly' as const,
  })),
  ...caseStudies.map((caseStudy) => ({
    path: `/case-studies/${caseStudy.slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  })),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteIndexingEnabled) {
    return [];
  }

  let packageRoutes: SitemapEntry[] = [];
  try {
    packageRoutes = (await listPublishedPackages()).map((pack) => ({
      path: `/packages/${pack.slug}`,
      priority: pack.featured ? 0.86 : 0.78,
      changeFrequency: 'weekly' as const,
      lastModified: pack.updatedAt,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown package API error';
    console.error(`[sitemap] Package URLs unavailable: ${message}`);
  }

  return [...routes, ...packageRoutes].map((route) => ({
    url: `${siteUrl}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.lastModified ? { lastModified: route.lastModified } : {}),
  }));
}
