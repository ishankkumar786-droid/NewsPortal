'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Media, PaginationMeta } from '@/types';

interface MediaResponse {
  media: Media[];
}

interface MediaFilters {
  page?: number;
  limit?: number;
  type?: 'image' | 'video';
  folder?: string;
}

export const useMedia = (filters: MediaFilters = {}) => {
  return useQuery({
    queryKey: ['media', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      const res = await api.get<{ data: MediaResponse; pagination: PaginationMeta }>(
        `/media?${params}`
      );
      return {
        media: res.data.data?.media || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, alt, caption }: { file: File; alt?: string; caption?: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (alt) formData.append('alt', alt);
      if (caption) formData.append('caption', caption);

      const res = await api.post<{ data: { media: Media } }>('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data!.media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};
