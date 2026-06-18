'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { AuditLog, PaginationMeta } from '@/types';

interface AuditLogsResponse {
  auditLogs: AuditLog[];
}

interface AuditLogFilters {
  page?: number;
  limit?: number;
  action?: string;
  performedBy?: string;
}

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      const res = await api.get<{ data: AuditLogsResponse; pagination: PaginationMeta }>(
        `/audit-logs?${params}`
      );
      return {
        auditLogs: res.data.data?.auditLogs || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};
