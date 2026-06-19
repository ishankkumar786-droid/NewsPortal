'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Moon, Sun, Menu, X, Newspaper } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/useCategories';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PublicHeader() {
  const { data: categories } = useCategories({ isActive: true });
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 bg-background transition-shadow',
        scrolled && 'shadow-md'
      )}
      role="banner"
    >
      {/* Top Bar */}
      <div className="bg-news-dark text-white py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between text-xs">
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span>Welcome, {user.name}</span>
                {user.role !== 'visitor' && (
                  <Link
                    href={user.role === 'super_admin' ? '/admin/dashboard' : '/reporter/dashboard'}
                    className="text-news-red hover:underline"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={() => logout()}
                  className="hover:text-news-red transition-colors font-medium cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="hover:text-news-red transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="KhabarPatra - Home"
          >
            <Newspaper className="h-8 w-8 text-news-red" />
            <span className="font-serif font-bold text-xl sm:text-2xl">
              KhabarPatra
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md hidden md:flex items-center gap-2"
            role="search"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search news..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search articles"
              />
            </div>
            <Button type="submit" size="sm">Search</Button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <nav
        className="border-b bg-muted/30 hidden md:block"
        aria-label="Category navigation"
      >
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none" role="list">
            <li>
              <Link
                href="/"
                className="block px-3 py-3 text-sm font-medium hover:text-news-red transition-colors whitespace-nowrap"
              >
                Home
              </Link>
            </li>
            {(categories || []).slice(0, 10).map((cat) => (
              <li key={cat._id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="block px-3 py-3 text-sm font-medium hover:text-news-red transition-colors whitespace-nowrap"
                  style={{ color: 'inherit' }}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background p-4 space-y-4" role="navigation">
          <form onSubmit={handleSearch} className="flex gap-2" role="search">
            <Input
              type="search"
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search articles"
            />
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <nav>
            <ul className="grid grid-cols-2 gap-1" role="list">
              <li>
                <Link
                  href="/"
                  className="block px-3 py-2 text-sm rounded hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              {(categories || []).map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="block px-3 py-2 text-sm rounded hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
