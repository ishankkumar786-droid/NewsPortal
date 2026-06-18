'use client';

import { Bell, Moon, Sun, LogOut, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useLogout } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export function AdminHeader() {
  const { user } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-6"
      role="banner"
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-sm text-muted-foreground hidden sm:block">
          Welcome back,{' '}
          <span className="font-semibold text-foreground">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* View Public Site */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            View Site
          </Link>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 border-l pl-3 ml-1">
          <Link
            href={user?.role === 'super_admin' ? '/admin/profile' : '/reporter/profile'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                {getInitials(user?.name || 'A')}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
