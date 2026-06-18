'use client';

import {
  FileText,
  CheckCircle,
  Clock,
  Users,
  FolderOpen,
  Eye,
  Megaphone,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardStats, useViewsOverTime, useMostViewedArticles, useCategoryPerformance } from '@/hooks/useAnalytics';
import { formatNumber, formatRelativeTime, formatDate } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, description, color = 'text-primary' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{formatNumber(Number(value))}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: viewsData, isLoading: viewsLoading } = useViewsOverTime(30);
  const { data: topArticles, isLoading: articlesLoading } = useMostViewedArticles(5);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryPerformance();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64" aria-live="polite" aria-busy>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-label="Admin dashboard">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your news portal</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Articles"
          value={stats?.totalArticles || 0}
          icon={FileText}
          color="text-blue-500"
        />
        <StatCard
          title="Published"
          value={stats?.publishedArticles || 0}
          icon={CheckCircle}
          description="Live on site"
          color="text-green-500"
        />
        <StatCard
          title="Pending Review"
          value={stats?.pendingArticles || 0}
          icon={Clock}
          description="Needs attention"
          color="text-yellow-500"
        />
        <StatCard
          title="Total Views"
          value={stats?.totalViews || 0}
          icon={Eye}
          color="text-purple-500"
        />
        <StatCard
          title="Reporters"
          value={stats?.totalReporters || 0}
          icon={Users}
          color="text-indigo-500"
        />
        <StatCard
          title="Categories"
          value={stats?.totalCategories || 0}
          icon={FolderOpen}
          color="text-orange-500"
        />
        <StatCard
          title="Active Ads"
          value={stats?.totalAds || 0}
          icon={Megaphone}
          color="text-pink-500"
        />
        <StatCard
          title="Engagement"
          value={stats?.publishedArticles ? Math.round((stats.totalViews || 0) / stats.publishedArticles) : 0}
          icon={TrendingUp}
          description="Avg views/article"
          color="text-teal-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Article views in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {viewsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={viewsData || []}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e63946" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)} // Show MM-DD
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#e63946"
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Views by category</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={(categoryData || []).slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="totalViews" fill="#e63946" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Most Viewed Articles</CardTitle>
          <CardDescription>Top performing content</CardDescription>
        </CardHeader>
        <CardContent>
          {articlesLoading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {(topArticles || []).map((article: {
                _id: string;
                title: string;
                viewCount: number;
                publishDate?: string;
                category?: { name: string; color: string };
              }, i: number) => (
                <div key={article._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
                  <span className="text-2xl font-bold text-muted-foreground w-8 flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {article.category && (
                        <Badge
                          variant="outline"
                          style={{ borderColor: article.category.color, color: article.category.color }}
                          className="text-xs"
                        >
                          {article.category.name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {article.publishDate ? formatRelativeTime(article.publishDate) : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(article.viewCount)}</span>
                  </div>
                </div>
              ))}
              {(!topArticles || topArticles.length === 0) && (
                <p className="text-center text-muted-foreground py-8">No articles published yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
