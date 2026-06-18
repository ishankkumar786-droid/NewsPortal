'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { Search, Filter } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  category?: string;
  page: number;
}

export function SearchResults({ query, category, page }: SearchResultsProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);

  const { data: categories } = useCategories({ isActive: true });
  const { data, isLoading } = useArticles({
    search: query,
    category: category,
    status: 'published',
    page,
    limit: 12,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.articles || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const params = new URLSearchParams({ q: searchInput.trim() });
      if (category) params.set('category', category);
      router.push(`/search?${params}`);
    }
  };

  const handleCategoryFilter = (slug?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (slug) params.set('category', slug);
    router.push(`/search?${params}`);
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6" role="search">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search articles"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          {query ? (
            <h1 className="text-lg font-semibold">
              {isLoading ? 'Searching...' : `${pagination?.total || 0} results for `}
              {!isLoading && query && <span className="text-news-red">"{query}"</span>}
            </h1>
          ) : (
            <h1 className="text-lg font-semibold">All Articles</h1>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => handleCategoryFilter(undefined)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              !category ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
            }`}
          >
            All
          </button>
          {(categories || []).slice(0, 8).map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                category === cat.slug ? 'bg-primary text-white border-primary' : 'hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No articles found</h2>
          <p className="text-muted-foreground">
            {query
              ? `No results for "${query}". Try different keywords.`
              : 'No articles match your filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article._id}
                className="group border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {article.featuredImage?.url && (
                  <Link href={`/article/${article.slug}`}>
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={article.featuredImage.url}
                        alt={article.featuredImage.alt || article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-4">
                  {article.category && (
                    <Badge
                      variant="outline"
                      className="text-xs mb-2"
                      style={{ borderColor: article.category.color, color: article.category.color }}
                    >
                      {article.category.name}
                    </Badge>
                  )}
                  <h3 className="font-semibold line-clamp-2 group-hover:text-news-red transition-colors">
                    <Link href={`/article/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {article.summary}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {article.publishDate ? formatRelativeTime(article.publishDate) : ''}
                    {' · '}{article.author?.name}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (query) params.set('q', query);
                      if (category) params.set('category', category);
                      params.set('page', String(p));
                      router.push(`/search?${params}`);
                    }}
                    aria-label={`Page ${p}`}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </Button>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
