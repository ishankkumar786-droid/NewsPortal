'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useArticles } from '@/hooks/useArticles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Clock, Loader2 } from 'lucide-react';
import type { Article } from '@/types';

export function HeroSection({ articles: initialArticles }: { articles?: Article[] }) {
  const { data, isLoading, isError, error, isFetching, refetch } = useArticles({
    isFeatured: true,
    status: 'published',
    limit: 5,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.articles || initialArticles || [];
  const [hero, ...secondary] = articles;

  if (isError && !initialArticles) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive font-medium">Failed to load featured articles</p>
        <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || 'The server may be unavailable.'}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <Loader2 className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading && !data && !initialArticles) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-busy aria-live="polite">
        <Skeleton className="h-80 md:h-[420px] rounded-xl" />
        <div className="grid grid-rows-2 gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!hero && !isFetching && !initialArticles) return null;

  if (!hero) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main Hero Article */}
      <Link
        href={`/article/${hero.slug}`}
        className="group relative overflow-hidden rounded-xl bg-gray-900 aspect-[16/9] md:aspect-auto md:h-[420px] block"
        aria-label={`Read: ${hero.title}`}
      >
        {hero.featuredImage?.url ? (
          <Image
            src={hero.featuredImage.url}
            alt={hero.featuredImage.alt || hero.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-news-dark to-news-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {hero.category && (
            <Badge
              className="mb-2 text-xs font-bold uppercase"
              style={{ backgroundColor: hero.category.color, color: 'white' }}
            >
              {hero.category.name}
            </Badge>
          )}
          <h1 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight line-clamp-3">
            {hero.title}
          </h1>
          <p className="text-gray-300 text-sm mt-2 line-clamp-2">{hero.summary}</p>
          <div className="flex items-center gap-3 mt-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {hero.publishDate ? formatRelativeTime(hero.publishDate) : ''}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {hero.viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>

      {/* Secondary Articles */}
      <div className="grid grid-rows-2 gap-4">
        {secondary.slice(0, 2).map((article) => (
          <Link
            key={article._id}
            href={`/article/${article.slug}`}
            className="group relative overflow-hidden rounded-xl bg-gray-900 block"
            aria-label={`Read: ${article.title}`}
          >
            {article.featuredImage?.url ? (
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-news-navy to-news-blue" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {article.category && (
                <Badge
                  className="mb-1 text-xs"
                  style={{ backgroundColor: article.category.color, color: 'white' }}
                >
                  {article.category.name}
                </Badge>
              )}
              <h2 className="font-serif text-sm md:text-base font-bold text-white leading-tight line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {article.publishDate ? formatRelativeTime(article.publishDate) : ''}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
