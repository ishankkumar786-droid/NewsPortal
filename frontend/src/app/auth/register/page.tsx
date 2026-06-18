import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new News Portal account',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-news-dark to-news-blue p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white">📰 News Portal</h1>
          <p className="text-gray-300 mt-2">Join our community of readers</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
