import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage(props: PageProps) {
  const params = await props.params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  );
}
