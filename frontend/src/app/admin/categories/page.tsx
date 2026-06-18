import type { Metadata } from 'next';
import { AdminCategoriesManager } from '@/components/admin/categories/AdminCategoriesManager';

export const metadata: Metadata = {
  title: 'Categories Management',
  robots: { index: false },
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesManager />;
}
