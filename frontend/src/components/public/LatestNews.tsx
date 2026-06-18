'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useInfiniteArticles } from '@/hooks/useArticles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { Eye, Loader2 } from 'lucide-react';
import type { Article } from '@/types';

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex gap-4 py-4 border-b last:border-b-0 animate-fade-in">
      {article.featuredImage?.url && (
        <Link href={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-20 sm:w-32 sm:h-24 rounded-lg overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="128px"
            />
          </div>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {article.category && (
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: article.category.color, color: article.category.color }}
            >
              {article.category.name}
            </Badge>
          )}
          {article.isBreaking && (
            <Badge className="text-xs bg-news-red text-white">Breaking</Badge>
          )}
        </div>
        <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-news-red transition-colors">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{article.summary}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span>{article.author?.name}</span>
          <span>•</span>
          <span>{article.publishDate ? formatRelativeTime(article.publishDate) : ''}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
}

export function LatestNews() {
  const { data, isLoading, isError, error, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteArticles({
    status: 'published',
    limit: 10,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.pages.flatMap((p) => p.articles) || [];
  // Only show skeleton on true first load (no data at all yet)
  const showSkeleton = isLoading && articles.length === 0;

  return (
    <section aria-label="Latest news">
      <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 after:flex-1 after:h-px after:bg-border after:ml-2">
        Latest News
      </h2>

      {isError ? (
        <div className="py-12 text-center">
          <p className="text-destructive font-medium">Failed to load articles</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || 'The server may be unavailable.'}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            <Loader2 className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : showSkeleton ? (
        <div className="space-y-4" aria-busy aria-live="polite">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 py-4 border-b">
              <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div>
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {articles.length === 0 && !isFetching && (
            <div className="py-12 text-center text-muted-foreground">
              No articles available yet
            </div>
          )}

          {hasNextPage && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
