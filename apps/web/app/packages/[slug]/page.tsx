import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/page-shell';
import { PackageDetail } from '@/components/packages/package-detail';
import { getPublicPackage } from '@/lib/public-packages';
import { siteName, siteUrl } from '@/lib/seo-content';

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const pack = await getPublicPackage(params.slug);
  if (!pack) notFound();

  return {
    title: pack.title,
    description: pack.shortDescription,
    keywords: [pack.targetRole, pack.category, pack.level, ...pack.skills],
    alternates: { canonical: `/packages/${pack.slug}` },
    openGraph: {
      title: pack.title,
      description: pack.shortDescription,
      url: `/packages/${pack.slug}`,
      images: [{ url: '/brand/mentormind-og.png', width: 1200, height: 630 }],
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const pack = await getPublicPackage(params.slug);
  if (!pack) notFound();

  const packageUrl = `${siteUrl}/packages/${pack.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${packageUrl}#product`,
        name: pack.title,
        description: pack.longDescription,
        url: packageUrl,
        image: `${siteUrl}/brand/mentormind-og.png`,
        category: pack.category,
        brand: { '@type': 'Brand', name: siteName },
        audience: { '@type': 'Audience', audienceType: pack.targetAudience },
        offers: {
          '@type': 'Offer',
          url: packageUrl,
          price: String(pack.price),
          priceCurrency: pack.currency,
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${packageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: siteName, item: siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Gói học', item: `${siteUrl}/packages` },
          { '@type': 'ListItem', position: 3, name: pack.title, item: packageUrl },
        ],
      },
    ],
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
        <PackageDetail slug={pack.slug} initialData={pack} />
      </section>
    </PageShell>
  );
}
