import type { Metadata } from 'next';
import { AdminAnalytics } from '@/components/admin/analytics/AdminAnalytics';

export const metadata: Metadata = {
  title: 'Analytics',
  robots: { index: false },
};

export default function AdminAnalyticsPage() {
  return <AdminAnalytics />;
}
