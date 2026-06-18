'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type {
  DashboardStats,
  ReporterStats,
  ViewsOverTimeData,
  CategoryPerformanceData,
} from '@/types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<{ data: DashboardStats }>(`/analytics/dashboard?_t=${Date.now()}`);
      return res.data.data!;
    },
    staleTime: 0,
  });
};

export const useReporterStats = () => {
  return useQuery({
    queryKey: ['analytics', 'my-stats'],
    queryFn: async () => {
      const res = await api.get<{ data: ReporterStats }>(`/analytics/my-stats?_t=${Date.now()}`);
      return res.data.data!;
    },
    staleTime: 0,
  });
};

export const useViewsOverTime = (days = 30) => {
  return useQuery({
    queryKey: ['analytics', 'views-over-time', days],
    queryFn: async () => {
      const res = await api.get<{ data: { data: ViewsOverTimeData[] } }>(
        `/analytics/views-over-time?days=${days}`
      );
      return res.data.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useMostViewedArticles = (limit = 10) => {
  return useQuery({
    queryKey: ['analytics', 'most-viewed', limit],
    queryFn: async () => {
      const res = await api.get(`/analytics/most-viewed?limit=${limit}`);
      return res.data.data?.articles || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategoryPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: async () => {
      const res = await api.get<{ data: { data: CategoryPerformanceData[] } }>(
        '/analytics/categories'
      );
      return res.data.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useReporterPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'reporters'],
    queryFn: async () => {
      const res = await api.get('/analytics/reporters');
      return res.data.data?.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useAdPerformance = () => {
  return useQuery({
    queryKey: ['analytics', 'advertisements'],
    queryFn: async () => {
      const res = await api.get('/analytics/advertisements');
      return res.data.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
