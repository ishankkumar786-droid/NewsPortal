import type { Metadata } from 'next';
import { AdminMediaLibrary } from '@/components/admin/media/AdminMediaLibrary';

export const metadata: Metadata = {
  title: 'Media Library',
  robots: { index: false },
};

export default function AdminMediaPage() {
  return <AdminMediaLibrary />;
}
