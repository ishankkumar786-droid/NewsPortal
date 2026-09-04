'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import type { Article } from '@/types';

interface CategorySectionProps {
  categorySlug: string;
  label: string;
  variant?: 'main' | 'sidebar' | 'full';
}

function SmallArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex items-center gap-3 pt-2.5 first:pt-0">
      {article.featuredImage?.url ? (
        <Link href={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="relative w-16 h-12 rounded-md overflow-hidden bg-muted">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="64px"
            />
          </div>
        </Link>
      ) : (
        <div className="w-16 h-12 rounded-md bg-muted flex-shrink-0 flex items-center justify-center text-xs text-muted-foreground font-serif font-bold">
          {article.title[0]}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium line-clamp-2 leading-snug group-hover:text-news-red transition-colors">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {article.publishDate ? formatRelativeTime(article.publishDate) : ''}
        </p>
      </div>
    </article>
  );
}

export function CategorySection({ categorySlug, label, variant = 'main' }: CategorySectionProps) {
  const limit = variant === 'sidebar' ? 4 : 5;
  const { data, isLoading, isFetching } = useArticles({
    category: categorySlug,
    status: 'published',
    limit,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.articles || [];

  if (!isLoading && !isFetching && articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="py-2" aria-labelledby={`section-${categorySlug}`}>
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-border/60">
        <h2
          id={`section-${categorySlug}`}
          className="text-lg font-serif font-bold text-news-red flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-news-red rounded-full inline-block" />
          {label}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-xs text-muted-foreground hover:text-news-red transition-colors flex items-center gap-0.5"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && !data ? (
        <div className="space-y-3">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-16 h-12 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : variant === 'sidebar' ? (
        /* Sidebar Layout: 1 Featured banner on top + clean stacked list below */
        <div className="space-y-3">
          {featured && (
            <article className="group relative rounded-xl overflow-hidden bg-muted aspect-video w-full">
              {featured.featuredImage?.url ? (
                <Image
                  src={featured.featuredImage.url}
                  alt={featured.featuredImage.alt || featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 350px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-news-navy to-news-blue" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-serif text-sm font-bold text-white line-clamp-2 leading-snug">
                  <Link href={`/article/${featured.slug}`} className="hover:text-news-red/90">
                    {featured.title}
                  </Link>
                </h3>
                <p className="text-gray-300 text-[11px] mt-1">
                  {featured.publishDate ? formatRelativeTime(featured.publishDate) : ''}
                </p>
              </div>
            </article>
          )}

          {/* Stacked list for remaining articles */}
          {rest.length > 0 && (
            <div className="space-y-2.5 divide-y divide-border/30">
              {rest.map((article) => (
                <SmallArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : variant === 'full' ? (
        /* Full Width Layout: 1 Featured (1 col) + 4 articles in 2 cols */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured && (
            <article className="group relative rounded-xl overflow-hidden bg-muted aspect-[16/10] md:h-full md:aspect-auto min-h-[220px]">
              {featured.featuredImage?.url ? (
                <Image
                  src={featured.featuredImage.url}
                  alt={featured.featuredImage.alt || featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-news-navy to-news-blue" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-base font-bold text-white line-clamp-2">
                  <Link href={`/article/${featured.slug}`} className="hover:text-news-red/90">
                    {featured.title}
                  </Link>
                </h3>
                <p className="text-gray-300 text-xs mt-1">
                  {featured.publishDate ? formatRelativeTime(featured.publishDate) : ''}
                </p>
              </div>
            </article>
          )}

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 sm:gap-4">
            {rest.map((article) => (
              <SmallArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        /* Main 2/3 Column Layout: 1 Featured + 3-4 side cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featured && (
            <article className="group relative rounded-xl overflow-hidden bg-muted aspect-[16/10] min-h-[200px]">
              {featured.featuredImage?.url ? (
                <Image
                  src={featured.featuredImage.url}
                  alt={featured.featuredImage.alt || featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-news-navy to-news-blue" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3.5">
                <h3 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-2">
                  <Link href={`/article/${featured.slug}`} className="hover:text-news-red/90">
                    {featured.title}
                  </Link>
                </h3>
                <p className="text-gray-300 text-xs mt-1">
                  {featured.publishDate ? formatRelativeTime(featured.publishDate) : ''}
                </p>
              </div>
            </article>
          )}

          <div className="space-y-2.5 divide-y divide-border/30">
            {rest.map((article) => (
              <SmallArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
