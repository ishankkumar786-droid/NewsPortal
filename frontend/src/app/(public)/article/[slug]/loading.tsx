'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ArticleLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-300">
      {/* Category badge */}
      <Skeleton className="h-6 w-24 rounded-full mb-4" />

      {/* Title */}
      <Skeleton className="h-10 w-full mb-2" />
      <Skeleton className="h-10 w-3/4 mb-6" />

      {/* Author & date row */}
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      {/* Featured image */}
      <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-xl mb-8" />

      {/* Article body paragraphs */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Second paragraph block */}
      <div className="space-y-4 mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Tags */}
      <div className="flex gap-2 mt-10">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-14 rounded-full" />
      </div>
    </main>
  );
}
