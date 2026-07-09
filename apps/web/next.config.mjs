/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mentormind/shared'],
  experimental: {
    typedRoutes: false
  }
};

export default nextConfig;
