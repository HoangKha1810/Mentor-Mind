import type { MetadataRoute } from 'next';

const siteUrl = 'https://mentormind.center';

const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/packages', priority: 0.9, changeFrequency: 'daily' },
  { path: '/pricing', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/create-roadmap', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/code-practice', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/ai-interview', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/resources', priority: 0.8, changeFrequency: 'daily' },
  { path: '/login', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/register', priority: 0.6, changeFrequency: 'monthly' },
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
