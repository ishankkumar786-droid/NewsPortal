import type { Metadata } from 'next';
import { AdminUsersManager } from '@/components/admin/users/AdminUsersManager';

export const metadata: Metadata = {
  title: 'Users Management',
  robots: { index: false },
};

export default function AdminUsersPage() {
  return <AdminUsersManager />;
}
