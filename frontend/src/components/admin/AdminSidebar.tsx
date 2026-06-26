'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  BarChart3,
  Megaphone,
  Image,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Articles',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Advertisements',
    href: '/admin/advertisements',
    icon: Megaphone,
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: ClipboardList,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <>
      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-news-dark text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto',
          'w-64 md:transition-all',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:w-auto',
          sidebarOpen ? 'md:w-64' : 'md:w-16',
        )}
        aria-label="Admin navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 flex-shrink-0 text-news-red" />
            <span className={cn('font-serif font-bold text-lg truncate md:hidden', sidebarOpen ? 'md:block' : 'md:hidden')}>
              Khabarpath
            </span>
            {sidebarOpen && <span className="hidden md:block font-serif font-bold text-lg truncate">Khabarpath</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-gray-300 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 px-2" role="navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-news-red text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn('truncate', !sidebarOpen && 'md:hidden')}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop collapse toggle */}
        <div className="hidden md:block p-2 border-t border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full text-gray-300 hover:text-white hover:bg-white/10"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </aside>
    </>
  );
}
