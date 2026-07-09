import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });
const siteUrl = 'https://mentormind.center';
const siteName = 'MentorMind';
const siteDescription =
  'MentorMind là dịch vụ học trực tuyến cá nhân hóa với lộ trình AI, mentor 1-1, luyện code, luyện phỏng vấn và tài nguyên học tập cho người muốn sẵn sàng đi làm.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/brand/mentormind-logo.png`,
      image: `${siteUrl}/brand/mentormind-og.png`,
      sameAs: ['https://github.com/HoangKha1810/Mentor-Mind'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'vi-VN',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/resources?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: 'MentorMind - Dịch vụ học trực tuyến cá nhân hóa với AI và mentor',
    template: '%s | MentorMind',
  },
  description: siteDescription,
  keywords: [
    'MentorMind',
    'dịch vụ học trực tuyến',
    'học lập trình online',
    'mentor 1-1',
    'lộ trình học AI',
    'luyện phỏng vấn AI',
    'luyện code',
    'sửa CV',
    'học lập trình đi làm',
  ],
  authors: [{ name: 'MentorMind' }],
  creator: 'MentorMind',
  publisher: 'MentorMind',
  category: 'education',
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/',
    },
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/mentormind-icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/mentormind-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icon.png'],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    url: '/',
    siteName,
    title: 'MentorMind - Dịch vụ học trực tuyến cá nhân hóa',
    description: siteDescription,
    locale: 'vi_VN',
    images: [
      {
        url: '/brand/mentormind-og.png',
        width: 1200,
        height: 630,
        alt: 'MentorMind - Dịch vụ học trực tuyến',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MentorMind - Dịch vụ học trực tuyến cá nhân hóa',
    description: siteDescription,
    images: ['/brand/mentormind-og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#07111f',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <body className={inter.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
