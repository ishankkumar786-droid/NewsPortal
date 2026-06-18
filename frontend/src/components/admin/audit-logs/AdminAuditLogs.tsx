'use client';

import { useState } from 'react';
import { Loader2, Calendar, User, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { formatDate } from '@/lib/utils';
import type { AuditLog } from '@/types';

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: 'bg-blue-500/10 text-blue-600',
  USER_LOGOUT: 'bg-zinc-500/10 text-zinc-500',
  USER_REGISTER: 'bg-emerald-500/10 text-emerald-600',
  ARTICLE_CREATED: 'bg-emerald-500/10 text-emerald-600',
  ARTICLE_UPDATED: 'bg-blue-500/10 text-blue-600',
  ARTICLE_SUBMITTED: 'bg-yellow-500/10 text-yellow-600',
  ARTICLE_APPROVED: 'bg-emerald-500/10 text-emerald-600',
  ARTICLE_REJECTED: 'bg-red-500/10 text-red-500',
  ARTICLE_PUBLISHED: 'bg-purple-500/10 text-purple-600',
  ARTICLE_DELETED: 'bg-red-500/10 text-red-500',
  AD_CREATED: 'bg-emerald-500/10 text-emerald-600',
  AD_UPDATED: 'bg-blue-500/10 text-blue-600',
  AD_DELETED: 'bg-red-500/10 text-red-500',
  MEDIA_UPLOADED: 'bg-emerald-500/10 text-emerald-600',
  MEDIA_DELETED: 'bg-red-500/10 text-red-500',
};

export function AdminAuditLogs() {
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  
  const { data, isLoading } = useAuditLogs({
    page,
    limit: 20,
    action: filterAction || undefined,
  });

  const logs = data?.auditLogs || [];
  const pagination = data?.pagination;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track system activity and user actions</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterAction}
              onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm max-w-xs"
            >
              <option value="">All Actions</option>
              {Object.keys(ACTION_COLORS).map(action => (
                <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-y">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-medium">Timestamp</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Resource</th>
                    <th className="px-6 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-muted/30">
                      <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <Badge className={ACTION_COLORS[log.action] || 'bg-secondary'}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{log.performedBy?.name || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-muted-foreground">
                        {log.targetResource ? (
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            {log.targetResource}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-3 max-w-xs truncate text-muted-foreground">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
