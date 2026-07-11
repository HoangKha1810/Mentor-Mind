import type { MetadataRoute } from 'next';
import { blogArticles, caseStudies, seoCourses } from '@/lib/seo-growth-content';
import { seoLandingPages, siteUrl } from '@/lib/seo-content';

const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
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

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
