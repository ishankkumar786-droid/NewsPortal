'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Advertisement, PaginationMeta, AdSlot } from '@/types';

interface AdsResponse {
  advertisements: Advertisement[];
}

interface AdFilters {
  page?: number;
  limit?: number;
  slot?: string;
  status?: string;
}

export const useAdvertisements = (filters: AdFilters = {}) => {
  return useQuery({
    queryKey: ['advertisements', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      const res = await api.get<{ data: AdsResponse; pagination: PaginationMeta }>(
        `/advertisements?${params}`
      );
      return {
        advertisements: res.data.data?.advertisements || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useActiveAdBySlot = (slot: AdSlot) => {
  return useQuery({
    queryKey: ['ad-slot', slot],
    queryFn: async () => {
      const res = await api.get<{ data: { advertisement: Advertisement | null } }>(
        `/advertisements/slot/${slot}`
      );
      return res.data.data?.advertisement || null;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post<{ data: { advertisement: Advertisement } }>(
        '/advertisements',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return res.data.data!.advertisement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData | Record<string, unknown> }) => {
      const isFormData = data instanceof FormData;
      const res = await api.patch<{ data: { advertisement: Advertisement } }>(
        `/advertisements/${id}`,
        data,
        isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
      );
      return res.data.data!.advertisement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/advertisements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useTrackImpression = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/advertisements/${id}/impression`);
    },
  });
};

export const useTrackClick = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/advertisements/${id}/click`);
    },
  });
};
