'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { AxiosError } from 'axios';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleView } from './ArticleView';
import type { Article } from '@/types';

interface ArticleClientPreviewProps {
  slug: string;
}

/**
 * Client-side preview fallback for the public article page.
 *
 * The server component can only fetch published articles (it has no auth context,
 * since the access token lives in an httpOnly cookie on the backend origin and in
 * the in-memory auth store). When the server fetch returns null, we render this
 * component which re-fetches via the authenticated axios instance. Admins (any
 * status) and the article's author can then preview non-published articles.
 */
export function ArticleClientPreview({ slug }: ArticleClientPreviewProps) {
  const [status, setStatus] = useState<'loading' | 'found' | 'not-found'>('loading');
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get<{ data: { article: Article } }>(`/articles/slug/${slug}`)
      .then((res) => {
        if (cancelled) return;
        const found = res.data.data?.article;
        if (found) {
          setArticle(found);
          setStatus('found');
        } else {
          setStatus('not-found');
        }
      })
      .catch((err: AxiosError) => {
        if (cancelled) return;
        // 401/403/404 -> the viewer isn't allowed to see this (or it doesn't exist)
        void err;
        setStatus('not-found');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'not-found') {
    notFound();
  }

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsportal.com';
  const articleUrl = `${siteUrl}/article/${article!.slug}`;

  return <ArticleView article={article!} articleUrl={articleUrl} isPreview />;
}
