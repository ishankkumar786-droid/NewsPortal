'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Article, ArticleFormData, PaginationMeta } from '@/types';

interface ArticlesResponse {
  articles: Article[];
  pagination: PaginationMeta;
}

interface ArticleFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  author?: string;
  search?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useArticles = (filters: ArticleFilters = {}) => {
  return useQuery({
    queryKey: ['articles', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      // Cache-busting param to prevent stale browser HTTP cache responses
      params.set('_t', Date.now().toString());
      const res = await api.get<{ data: ArticlesResponse; pagination: PaginationMeta }>(
        `/articles?${params}`
      );
      return {
        articles: res.data.data?.articles || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 0,
  });
};

export const useInfiniteArticles = (filters: Omit<ArticleFilters, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['articles-infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), ...Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])
      )});
      const res = await api.get<{ data: ArticlesResponse; pagination: PaginationMeta }>(
        `/articles?${params}`
      );
      return {
        articles: res.data.data?.articles || [],
        pagination: res.data.pagination,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });
};

export const useArticle = (id: string) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await api.get<{ data: { article: Article } }>(`/articles/${id}`);
      return res.data.data!.article;
    },
    enabled: !!id,
  });
};

export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['article-slug', slug],
    queryFn: async () => {
      const res = await api.get<{ data: { article: Article } }>(`/articles/slug/${slug}`);
      return res.data.data!.article;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const res = await api.post<{ data: { article: Article } }>('/articles', data);
      return res.data.data!.article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useUpdateArticle = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ArticleFormData>) => {
      const res = await api.patch<{ data: { article: Article } }>(`/articles/${id}`, data);
      return res.data.data!.article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['article', id] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/articles/${id}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useSubmitArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: { article: Article } }>(`/articles/${id}/submit`);
      return res.data.data!.article;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useReviewArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      action,
      rejectionReason,
    }: {
      id: string;
      action: 'approve' | 'reject';
      rejectionReason?: string;
    }) => {
      const res = await api.post<{ data: { article: Article } }>(`/articles/${id}/review`, {
        action,
        rejectionReason,
      });
      return res.data.data!.article;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const usePublishArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post<{ data: { article: Article } }>(`/articles/${id}/publish`);
      return res.data.data!.article;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useScheduleArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scheduledDate }: { id: string; scheduledDate: string }) => {
      const res = await api.post<{ data: { article: Article } }>(`/articles/${id}/schedule`, {
        scheduledDate,
      });
      return res.data.data!.article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    },
  });
};

export const useUploadFeaturedImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, file }: { articleId: string; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post(`/articles/${articleId}/featured-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['articles-infinite'] });
    },
  });
};
