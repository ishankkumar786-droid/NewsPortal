import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your KhabarPatra account',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-news-dark to-news-blue p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white">
            📰 KhabarPatra
          </h1>
          <p className="text-gray-300 mt-2">Your trusted source for breaking news</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
