'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/auth/login');
      return;
    }

    if (user.role !== 'super_admin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite" aria-busy>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'super_admin') {
    return null;
  }

  return <>{children}</>;
}

export function ReporterGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace('/auth/login');
      return;
    }

    if (user.role !== 'reporter' && user.role !== 'super_admin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite" aria-busy>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'reporter' && user?.role !== 'super_admin')) {
    return null;
  }

  return <>{children}</>;
}
