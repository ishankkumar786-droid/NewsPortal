'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Category } from '@/types';

export const useCategories = (params?: { isActive?: boolean }) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
      const res = await api.get<{ data: { categories: Category[] } }>(`/categories?${query}`);
      return res.data.data?.categories || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes — categories rarely change
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const res = await api.get<{ data: { category: Category } }>(`/categories/${id}`);
      return res.data.data!.category;
    },
    enabled: !!id,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['category-slug', slug],
    queryFn: async () => {
      const res = await api.get<{ data: { category: Category } }>(`/categories/slug/${slug}`);
      return res.data.data!.category;
    },
    enabled: !!slug,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
      parentCategory?: string | null;
      order?: number;
    }) => {
      const res = await api.post<{ data: { category: Category } }>('/categories', data);
      return res.data.data!.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<{
      name: string;
      description: string;
      color: string;
      icon: string;
      isActive: boolean;
      order: number;
    }>) => {
      const res = await api.patch<{ data: { category: Category } }>(`/categories/${id}`, data);
      return res.data.data!.category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useReorderCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categories: Array<{ id: string; order: number }>) => {
      await api.put('/categories/reorder', { categories });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
