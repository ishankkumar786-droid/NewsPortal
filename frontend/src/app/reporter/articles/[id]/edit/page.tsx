'use client';

import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ArticleForm } from '@/components/reporter/editor/ArticleForm';
import { useArticle } from '@/hooks/useArticles';

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useArticle(id);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return <div className="p-6 text-center text-muted-foreground">Article not found</div>;
  }

  if (!['draft', 'rejected'].includes(article.status)) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>This article cannot be edited in its current status: <strong>{article.status}</strong></p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ArticleForm article={article} />
    </div>
  );
}
