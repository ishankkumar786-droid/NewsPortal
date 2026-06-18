import type { Metadata } from 'next';
import { AdminMediaLibrary } from '@/components/admin/media/AdminMediaLibrary';

export const metadata: Metadata = {
  title: 'Media Library - Reporter Dashboard',
  robots: { index: false },
};

export default function ReporterMediaPage() {
  return <AdminMediaLibrary />;
}
