import { noIndexMetadata } from '@/lib/seo-metadata';

export const metadata = noIndexMetadata;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
