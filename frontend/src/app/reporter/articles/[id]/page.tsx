'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Send, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticle, useSubmitArticle } from '@/hooks/useArticles';
import { useToast } from '@/hooks/use-toast';
import { formatDate, ARTICLE_STATUS_COLORS, ARTICLE_STATUS_LABELS, extractApiError } from '@/lib/utils';

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { data: article, isLoading } = useArticle(id);
  const { mutate: submitArticle, isPending: isSubmitting } = useSubmitArticle();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="p-6 text-center py-16">
        <p className="text-muted-foreground">Article not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/reporter/articles">Back to articles</Link>
        </Button>
      </div>
    );
  }

  const canEdit = ['draft', 'rejected'].includes(article.status);
  const canSubmit = ['draft', 'rejected'].includes(article.status);

  const handleSubmit = () => {
    submitArticle(article._id, {
      onSuccess: () => {
        toast({ title: 'Article submitted for review' });
        router.push('/reporter/articles');
      },
      onError: (err) => toast({ variant: 'destructive', title: 'Submit failed', description: extractApiError(err) }),
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/reporter/articles">
            <ArrowLeft className="h-4 w-4" />
            My Articles
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {article.status === 'published' && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/article/${article.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                View Live
              </Link>
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/reporter/articles/${article._id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
          {canSubmit && (
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${ARTICLE_STATUS_COLORS[article.status]}`}>
            {ARTICLE_STATUS_LABELS[article.status]}
          </span>
          {article.category && (
            <Badge variant="outline" style={{ borderColor: article.category.color, color: article.category.color }}>
              {article.category.name}
            </Badge>
          )}
          {article.isBreaking && <Badge className="bg-red-500 text-white">Breaking</Badge>}
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-3">{article.title}</h1>
        <p className="text-lg text-muted-foreground">{article.summary}</p>

        {article.status === 'rejected' && article.rejectionReason && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm font-semibold text-destructive mb-1">Rejection Reason:</p>
            <p className="text-sm text-destructive/80">{article.rejectionReason}</p>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>Created {formatDate(article.createdAt)}</span>
          {article.publishDate && <span>Published {formatDate(article.publishDate)}</span>}
          {article.status === 'published' && <span>{article.viewCount.toLocaleString()} views</span>}
        </div>
      </div>

      {article.featuredImage?.url && (
        <div className="relative aspect-video rounded-xl overflow-hidden">
          <img src={article.featuredImage.url} alt={article.featuredImage.alt || article.title} className="w-full h-full object-cover" />
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
        </CardContent>
      </Card>

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">#{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
