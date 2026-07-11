import type { MetadataRoute } from 'next';
import { siteIndexingEnabled, siteUrl } from '@/lib/seo-content';

export default function robots(): MetadataRoute.Robots {
  if (!siteIndexingEnabled) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
