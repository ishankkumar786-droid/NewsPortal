'use client';

import Link from 'next/link';
import { FileText, CheckCircle, Clock, XCircle, FilePlus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReporterStats } from '@/hooks/useAnalytics';
import { useArticles } from '@/hooks/useArticles';
import { formatRelativeTime, ARTICLE_STATUS_LABELS, ARTICLE_STATUS_COLORS, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import type { Article } from '@/types';

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReporterDashboard() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useReporterStats();
  const { data: recentData, isLoading: articlesLoading } = useArticles({
    author: user?.id,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const recentArticles = recentData?.articles || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Manage your articles and track their performance</p>
        </div>
        <Button asChild className="self-start sm:self-auto">
          <Link href="/reporter/articles/new">
            <FilePlus className="h-4 w-4" />
            Write New Article
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Articles" value={stats?.total || 0} icon={FileText} color="text-blue-500" />
          <StatCard title="Published" value={stats?.published || 0} icon={CheckCircle} color="text-green-500" />
          <StatCard title="Pending Review" value={stats?.pending || 0} icon={Clock} color="text-yellow-500" />
          <StatCard title="Rejected" value={stats?.rejected || 0} icon={XCircle} color="text-red-500" />
        </div>
      )}

      {/* Recent Articles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Articles</CardTitle>
            <CardDescription>Your latest work</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/reporter/articles" className="flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No articles yet. Start writing your first article!</p>
              <Button asChild className="mt-4">
                <Link href="/reporter/articles/new">
                  <FilePlus className="h-4 w-4" />
                  Write Article
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {recentArticles.map((article: Article) => (
                <div
                  key={article._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <Link
                      href={`/reporter/articles/${article._id}`}
                      className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(article.createdAt)}
                      </span>
                      {article.category && (
                        <span className="text-xs text-muted-foreground">
                          · {article.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        ARTICLE_STATUS_COLORS[article.status]
                      )}
                    >
                      {ARTICLE_STATUS_LABELS[article.status]}
                    </span>
                    {article.status === 'rejected' && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/reporter/articles/${article._id}/edit`}>Edit</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Article Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap text-sm">
            {[
              { label: 'Draft', color: 'bg-gray-200 text-gray-700' },
              { label: '→', color: '' },
              { label: 'Submit', color: 'bg-blue-100 text-blue-700' },
              { label: '→', color: '' },
              { label: 'Review', color: 'bg-yellow-100 text-yellow-700' },
              { label: '→', color: '' },
              { label: 'Approved', color: 'bg-green-100 text-green-700' },
              { label: '→', color: '' },
              { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
            ].map((step, i) => (
              step.label === '→' ? (
                <span key={i} className="text-muted-foreground">{step.label}</span>
              ) : (
                <span key={i} className={`px-2 py-0.5 rounded-full font-medium ${step.color}`}>
                  {step.label}
                </span>
              )
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            If rejected, you can edit and resubmit your article.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
