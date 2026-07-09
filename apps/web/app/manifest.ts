import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MentorMind - Dịch vụ học trực tuyến',
    short_name: 'MentorMind',
    description:
      'Lộ trình học cá nhân hóa, mentor 1-1, luyện code, luyện phỏng vấn AI và tài nguyên học tập.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#07111f',
    theme_color: '#07111f',
    lang: 'vi-VN',
    icons: [
      {
        src: '/brand/mentormind-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/mentormind-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/mentormind-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
