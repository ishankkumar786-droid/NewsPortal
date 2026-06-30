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
}

function SmallArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex gap-3">
      {article.featuredImage?.url && (
        <Link href={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="relative w-20 h-16 rounded-lg overflow-hidden">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="80px"
            />
          </div>
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-news-red transition-colors">
          <Link href={`/article/${article.slug}`}>{article.title}</Link>
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {article.publishDate ? formatRelativeTime(article.publishDate) : ''}
        </p>
      </div>
    </article>
  );
}

export function CategorySection({ categorySlug, label }: CategorySectionProps) {
  const { data, isLoading, isFetching } = useArticles({
    category: categorySlug,
    status: 'published',
    limit: 5,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.articles || [];

  if (!isLoading && !isFetching && articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="container mx-auto px-4 py-6" aria-labelledby={`section-${categorySlug}`}>
      <div className="flex items-center justify-between mb-4">
        <h2
          id={`section-${categorySlug}`}
          className="text-xl font-serif font-bold text-news-red"
        >
          {label}
        </h2>
        <Link
          href={`/category/${categorySlug}`}
          className="text-sm text-muted-foreground hover:text-news-red transition-colors flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <div className="md:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-20 h-16 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured article */}
          {featured && (
            <article className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-[4/3] md:h-full min-h-[250px]">
              {featured.featuredImage?.url ? (
                <Image
                  src={featured.featuredImage.url}
                  alt={featured.featuredImage.alt || featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-news-navy to-news-blue" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-base font-bold text-white line-clamp-3">
                  <Link href={`/article/${featured.slug}`} className="hover:text-news-red/80">
                    {featured.title}
                  </Link>
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {featured.publishDate ? formatRelativeTime(featured.publishDate) : ''}
                </p>
              </div>
            </article>
          )}

          {/* List of articles */}
          <div className="md:col-span-2 space-y-4">
            {rest.map((article) => (
              <SmallArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
