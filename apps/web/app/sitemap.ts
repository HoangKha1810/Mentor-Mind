import type { MetadataRoute } from 'next';
import { seoLandingPages, siteUrl } from '@/lib/seo-content';

const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/packages', priority: 0.9, changeFrequency: 'daily' },
  { path: '/pricing', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/create-roadmap', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/code-practice', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ai-interview', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/resources', priority: 0.8, changeFrequency: 'daily' },
  ...seoLandingPages.map((page) => ({
    path: `/${page.slug}`,
    priority: 0.78,
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
