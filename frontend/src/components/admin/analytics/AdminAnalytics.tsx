'use client';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Loader2, TrendingUp, Eye, Users, BarChart3, MousePointerClick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useDashboardStats, useViewsOverTime, useMostViewedArticles,
  useCategoryPerformance, useReporterPerformance, useAdPerformance,
} from '@/hooks/useAnalytics';
import type { AdStatus } from '@/types';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
const STATUS_COLORS: Record<AdStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600', inactive: 'bg-zinc-500/10 text-zinc-500',
  scheduled: 'bg-blue-500/10 text-blue-600', expired: 'bg-red-500/10 text-red-500',
};

export function AdminAnalytics() {
  const { data: viewsData, isLoading: viewsLoading } = useViewsOverTime(30);
  const { data: topArticles, isLoading: articlesLoading } = useMostViewedArticles(10);
  const { data: catPerf, isLoading: catLoading } = useCategoryPerformance();
  const { data: reporterPerf, isLoading: reporterLoading } = useReporterPerformance();
  const { data: adPerf, isLoading: adLoading } = useAdPerformance();

  const Spinner = () => <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  const tooltipStyle = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive performance metrics</p>
      </div>

      {/* Views Over Time */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Views Over Time (30 Days)</CardTitle></CardHeader>
        <CardContent>
          {viewsLoading ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                <Line type="monotone" dataKey="articles" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Bar Chart */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Category Performance</CardTitle></CardHeader>
          <CardContent>
            {catLoading ? <Spinner /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={catPerf || []}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="totalViews" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalArticles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        {/* Category Pie */}
        <Card>
          <CardHeader><CardTitle>Article Distribution</CardTitle></CardHeader>
          <CardContent>
            {catLoading ? <Spinner /> : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={catPerf || []} cx="50%" cy="50%" outerRadius={100} dataKey="totalArticles" nameKey="name"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {(catPerf || []).map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Viewed Articles */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Most Viewed Articles</CardTitle></CardHeader>
        <CardContent>
          {articlesLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">Title</th><th className="pb-3 font-medium">Category</th><th className="pb-3 font-medium text-right">Views</th></tr></thead>
                <tbody>
                  {(topArticles || []).map((a: Record<string, unknown>, i: number) => (
                    <tr key={a._id as string} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 font-medium max-w-xs truncate">{a.title as string}</td>
                      <td className="py-3"><Badge variant="outline">{(a.category as Record<string, string>)?.name || '—'}</Badge></td>
                      <td className="py-3 text-right font-semibold">{(a.viewCount as number)?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!topArticles || topArticles.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No data</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reporter Performance */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Reporter Performance</CardTitle></CardHeader>
        <CardContent>
          {reporterLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="pb-3">#</th><th className="pb-3">Reporter</th><th className="pb-3 text-right">Articles</th><th className="pb-3 text-right">Views</th></tr></thead>
                <tbody>
                  {(reporterPerf || []).map((r: Record<string, unknown>, i: number) => (
                    <tr key={r.reporterId as string} className="border-b last:border-0">
                      <td className="py-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 font-medium">{r.name as string}</td>
                      <td className="py-3 text-right">{r.totalArticles as number}</td>
                      <td className="py-3 text-right font-semibold">{(r.totalViews as number)?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!reporterPerf || reporterPerf.length === 0) && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No data</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ad Performance */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MousePointerClick className="h-5 w-5 text-primary" /> Ad Performance</CardTitle></CardHeader>
        <CardContent>
          {adLoading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="pb-3">Title</th><th className="pb-3">Slot</th><th className="pb-3">Status</th><th className="pb-3 text-right">Views</th><th className="pb-3 text-right">Clicks</th><th className="pb-3 text-right">CTR</th></tr></thead>
                <tbody>
                  {(adPerf || []).map((ad: Record<string, unknown>) => (
                    <tr key={ad._id as string} className="border-b last:border-0">
                      <td className="py-3 font-medium truncate max-w-xs">{ad.title as string}</td>
                      <td className="py-3"><Badge variant="outline">{(ad.slot as string)?.replace(/_/g, ' ')}</Badge></td>
                      <td className="py-3"><Badge className={STATUS_COLORS[(ad.status as AdStatus) || 'inactive']}>{ad.status as string}</Badge></td>
                      <td className="py-3 text-right">{(ad.views as number)?.toLocaleString()}</td>
                      <td className="py-3 text-right">{(ad.clicks as number)?.toLocaleString()}</td>
                      <td className="py-3 text-right font-semibold">{ad.ctr as number}%</td>
                    </tr>
                  ))}
                  {(!adPerf || adPerf.length === 0) && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No data</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
