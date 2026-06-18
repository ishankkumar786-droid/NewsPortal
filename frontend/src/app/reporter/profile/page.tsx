import type { Metadata } from 'next';
import { UserProfileSettings } from '@/components/profile/UserProfileSettings';

export const metadata: Metadata = {
  title: 'My Profile - Reporter Dashboard',
  robots: { index: false },
};

export default function ReporterProfilePage() {
  return <UserProfileSettings />;
}
