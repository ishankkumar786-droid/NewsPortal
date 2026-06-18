import type { Metadata } from 'next';
import { AdminAdvertisementsManager } from '@/components/admin/advertisements/AdminAdvertisementsManager';

export const metadata: Metadata = {
  title: 'Advertisement Management',
  robots: { index: false },
};

export default function AdminAdvertisementsPage() {
  return <AdminAdvertisementsManager />;
}
