import type { Metadata } from 'next';
import { AdminArticlesManager } from '@/components/admin/articles/AdminArticlesManager';

export const metadata: Metadata = {
  title: 'Articles Management',
  robots: { index: false },
};

export default function AdminArticlesPage() {
  return <AdminArticlesManager />;
}
