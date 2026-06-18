'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Eye, Check, X, Send, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useArticles,
  useReviewArticle,
  usePublishArticle,
  useDeleteArticle,
} from '@/hooks/useArticles';
import { useToast } from '@/hooks/use-toast';
import {
  formatRelativeTime,
  ARTICLE_STATUS_LABELS,
  ARTICLE_STATUS_COLORS,
  cn,
  extractApiError,
} from '@/lib/utils';
import type { Article, ArticleStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: ArticleStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending Review', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
];

interface RejectDialogProps {
  article: Article;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

function RejectDialog({ article, onConfirm, onCancel, isPending }: RejectDialogProps) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal>
      <div className="bg-background rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="font-bold text-lg mb-2">Reject Article</h2>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">&ldquo;{article.title}&rdquo;</p>
        <textarea
          rows={3}
          placeholder="Provide a reason for rejection..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)} disabled={isPending || !reason.trim()}>
            {isPending && <Loader2 className="animate-spin" />}
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminArticlesManager() {
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rejectingArticle, setRejectingArticle] = useState<Article | null>(null);
  const { toast } = useToast();

  const { data, isLoading, isError, error, refetch } = useArticles({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    page,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { mutate: reviewArticle, isPending: isReviewing } = useReviewArticle();
  const { mutate: publishArticle, isPending: isPublishing } = usePublishArticle();
  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();

  const articles = data?.articles || [];
  const pagination = data?.pagination;

  const queryClient = useQueryClient();

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
        
        const queryParams = key[1] as any;
        const queryStatus = queryParams?.status;

        // If the cache entry is for a specific status and our new status differs, remove it from this cache
        if (queryStatus && updates.status && queryStatus !== updates.status) {
          return { ...data, articles: data.articles.filter((a) => a._id !== articleId) };
        }

        // Otherwise, update it (this keeps it in the 'All' tab)
        return {
          ...data,
          articles: data.articles.map((a) => (a._id === articleId ? { ...a, ...updates } : a)),
        };
      });
    }
  };

  const handleApprove = (article: Article) => {
    updateArticleCache(article._id, { status: 'approved' });
    reviewArticle({ id: article._id, action: 'approve' }, {
      onSuccess: () => toast({ title: 'Article approved' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const handleReject = (article: Article, reason: string) => {
    updateArticleCache(article._id, { status: 'rejected' });
    reviewArticle({ id: article._id, action: 'reject', rejectionReason: reason }, {
      onSuccess: () => { toast({ title: 'Article rejected' }); setRejectingArticle(null); },
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const handlePublish = (article: Article) => {
    updateArticleCache(article._id, { status: 'published' });
    publishArticle(article._id, {
      onSuccess: () => toast({ title: 'Article published!' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const handleDelete = (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;
    removeArticleFromCache(article._id);
    deleteArticle(article._id, {
      onSuccess: () => toast({ title: 'Article deleted' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  return (
    <div className="space-y-6">
      {rejectingArticle && (
        <RejectDialog
          article={rejectingArticle}
          onConfirm={(reason) => handleReject(rejectingArticle, reason)}
          onCancel={() => setRejectingArticle(null)}
          isPending={isReviewing}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Articles Management</h1>
        <Button variant="outline" size="sm" onClick={() => refetch({ cancelRefetch: false })}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-2 flex-wrap" role="tablist">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              role="tab"
              aria-selected={statusFilter === f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-colors',
                statusFilter === f.value ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-60 ml-auto"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isError ? (
            <div className="p-6 text-center">
              <p className="text-destructive font-medium">Failed to load articles</p>
              <p className="text-sm text-muted-foreground mt-1">{(error as any)?.message || 'The server may be unavailable. Please try again.'}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch({ cancelRefetch: false })}>
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="font-medium">No articles found</p>
            </div>
          ) : (
            <div className="divide-y">
              {articles.map((article: Article) => (
                <div key={article._id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ARTICLE_STATUS_COLORS[article.status])}>
                        {ARTICLE_STATUS_LABELS[article.status]}
                      </span>
                      {article.category && (
                        <Badge variant="outline" style={{ borderColor: article.category.color, color: article.category.color }} className="text-xs">
                          {article.category.name}
                        </Badge>
                      )}
                      {article.isBreaking && <Badge className="bg-red-500 text-white text-xs">Breaking</Badge>}
                    </div>
                    <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>By {(article.author as { name: string })?.name}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(article.createdAt)}</span>
                      {article.status === 'published' && <span>• {article.viewCount.toLocaleString()} views</span>}
                    </div>
                    {article.rejectionReason && (
                      <p className="text-xs text-destructive mt-1">Reason: {article.rejectionReason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
                    <Button size="sm" variant="ghost" asChild title="View article">
                      <Link href={`/article/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>

                    {['submitted', 'pending_review'].includes(article.status) && (
                      <>
                        <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => handleApprove(article)} disabled={isReviewing} title="Approve">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setRejectingArticle(article)} title="Reject">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {article.status === 'approved' && (
                      <Button size="sm" onClick={() => handlePublish(article)} disabled={isPublishing}>
                        {isPublishing ? <Loader2 className="animate-spin h-3 w-3" /> : <Send className="h-4 w-4" />}
                        Publish
                      </Button>
                    )}

                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(article)} disabled={isDeleting} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
