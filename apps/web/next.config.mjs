const defaultSiteUrl = 'https://mentormind.center';

function canonicalSiteUrl() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl);
    url.hostname = url.hostname.replace(/^www\./i, '');
    return url;
  } catch {
    return new URL(defaultSiteUrl);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mentormind/shared'],
  experimental: {
    typedRoutes: false,
  },
  async redirects() {
    const canonical = canonicalSiteUrl();
    if (canonical.hostname === 'localhost' || !canonical.hostname.includes('.')) {
      return [];
    }
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www\\.${escapeRegex(canonical.hostname)}` }],
        destination: `${canonical.origin}/:path*`,
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
