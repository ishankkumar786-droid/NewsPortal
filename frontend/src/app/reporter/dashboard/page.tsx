import type { Metadata } from 'next';
import { ReporterDashboard } from '@/components/reporter/ReporterDashboard';

export const metadata: Metadata = {
  title: 'Reporter Dashboard',
  robots: { index: false, follow: false },
};

export default function ReporterDashboardPage() {
  return <ReporterDashboard />;
}
