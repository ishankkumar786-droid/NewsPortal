'use client';

import { useArticles } from '@/hooks/useArticles';
import Link from 'next/link';
import { Zap } from 'lucide-react';

export function BreakingNewsTicker() {
  const { data, isLoading } = useArticles({
    isBreaking: true,
    status: 'published',
    limit: 10,
    sortBy: 'publishDate',
    sortOrder: 'desc',
  });

  const articles = data?.articles || [];

  // Show the bar immediately — skeleton text while loading
  if (isLoading) {
    return (
      <div className="bg-news-red text-white py-2 overflow-hidden">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0 font-bold text-sm uppercase tracking-wider">
            <Zap className="h-4 w-4 fill-current" />
            <span>Breaking</span>
          </div>
          <div className="h-4 w-48 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div
      className="bg-news-red text-white py-2 overflow-hidden"
      role="marquee"
      aria-label="Breaking news"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-shrink-0 font-bold text-sm uppercase tracking-wider">
          <Zap className="h-4 w-4 fill-current" />
          <span>Breaking</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-ticker whitespace-nowrap inline-block">
            {articles.map((article, i) => (
              <span key={article._id} className="inline-flex items-center">
                <Link
                  href={`/article/${article.slug}`}
                  className="hover:underline text-sm px-8"
                >
                  {article.title}
                </Link>
                {i < articles.length - 1 && (
                  <span className="text-white/50">•</span>
                )}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {articles.map((article, i) => (
              <span key={`dup-${article._id}`} className="inline-flex items-center">
                <Link
                  href={`/article/${article.slug}`}
                  className="hover:underline text-sm px-8"
                >
                  {article.title}
                </Link>
                {i < articles.length - 1 && (
                  <span className="text-white/50">•</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
