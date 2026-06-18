'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FilePlus, Edit, Trash2, Send, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticles, useDeleteArticle, useSubmitArticle } from '@/hooks/useArticles';
import { useToast } from '@/hooks/use-toast';
import { formatRelativeTime, ARTICLE_STATUS_LABELS, ARTICLE_STATUS_COLORS, cn, extractApiError } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Article, ArticleStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: ArticleStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'In Review', value: 'pending_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
];

export function MyArticlesList() {
  const { user } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, isError, error, refetch } = useArticles({
    status: statusFilter === 'all' ? undefined : statusFilter,
    author: user?.id,
    page,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const queryClient = useQueryClient();
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();
  const { mutate: submitArticle, isPending: isSubmitting } = useSubmitArticle();

  const articles = data?.articles || [];
  const pagination = data?.pagination;

  const removeArticleFromCache = (articleId: string) => {
    const queries = queryClient.getQueriesData({ queryKey: ['articles'] });
    for (const [key] of queries) {
      queryClient.setQueryData(key, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('articles' in (old as Record<string, unknown>))) return old;
        const data = old as { articles: Article[] };
        return { ...data, articles: data.articles.filter((a) => a._id !== articleId) };
      });
    }
  };

  const updateArticleCache = (articleId: string, updates: Partial<Article>) => {
    const queries = queryClient.getQueriesData({ queryKey: ['articles'] });
    for (const [key] of queries) {
      queryClient.setQueryData(key, (old: unknown) => {
        if (!old || typeof old !== 'object' || !('articles' in (old as Record<string, unknown>))) return old;
        const data = old as { articles: Article[] };
        if (statusFilter !== 'all') {
          return { ...data, articles: data.articles.filter((a) => a._id !== articleId) };
        }
        return {
          ...data,
          articles: data.articles.map((a) =>
            a._id === articleId ? { ...a, ...updates } : a
          ),
        };
      });
    }
  };

  const handleDelete = (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    removeArticleFromCache(article._id);
    deleteArticle(article._id, {
      onSuccess: () => toast({ title: 'Article deleted' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Delete failed', description: extractApiError(err) }),
    });
  };

  const handleSubmit = (article: Article) => {
    updateArticleCache(article._id, { status: 'submitted' });
    submitArticle(article._id, {
      onSuccess: () => toast({ title: 'Article submitted for review' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Submit failed', description: extractApiError(err) }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Articles</h1>
        <Button asChild>
          <Link href="/reporter/articles/new">
            <FilePlus className="h-4 w-4" />
            Write Article
          </Link>
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter articles by status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={statusFilter === f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm transition-colors',
              statusFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="py-16 text-center">
              <p className="text-destructive font-medium">Failed to load articles</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || 'The server may be unavailable.'}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                <Loader2 className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <FilePlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No articles found</p>
              <p className="text-sm mt-1">
                {statusFilter === 'all'
                  ? 'Start writing your first article'
                  : `No ${ARTICLE_STATUS_LABELS[statusFilter] || statusFilter} articles`}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {articles.map((article: Article) => (
                <div key={article._id} className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          ARTICLE_STATUS_COLORS[article.status]
                        )}
                      >
                        {ARTICLE_STATUS_LABELS[article.status]}
                      </span>
                      {article.category && (
                        <span className="text-xs text-muted-foreground">{article.category.name}</span>
                      )}
                    </div>
                    <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                    {article.status === 'rejected' && article.rejectionReason && (
                      <p className="text-xs text-destructive mt-0.5 line-clamp-1">
                        Rejection: {article.rejectionReason}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(article.createdAt)}
                      {article.status === 'published' && (
                        <span> · {article.viewCount.toLocaleString()} views</span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {article.status === 'published' && (
                      <Button size="sm" variant="ghost" asChild title="View article">
                        <Link href={`/article/${article.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}

                    {['draft', 'rejected'].includes(article.status) && (
                      <>
                        <Button size="sm" variant="ghost" asChild title="Edit article">
                          <Link href={`/reporter/articles/${article._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSubmit(article)}
                          disabled={isSubmitting}
                          title="Submit for review"
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline ml-1">Submit</span>
                        </Button>
                      </>
                    )}

                    {article.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(article)}
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive"
                        title="Delete article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
