'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { User, PaginationMeta } from '@/types';

interface UsersResponse {
  users: User[];
}

interface UserFilters {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
}

export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      const res = await api.get<{ data: UsersResponse; pagination: PaginationMeta }>(
        `/users?${params}`
      );
      return {
        users: res.data.data?.users || [],
        pagination: res.data.pagination,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get<{ data: { user: User } }>(`/users/${id}`);
      return res.data.data!.user;
    },
    enabled: !!id,
  });
};

export const useCreateReporter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const res = await api.post<{ data: { user: User } }>('/users/reporters', data);
      return res.data.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await api.patch<{ data: { user: User } }>(`/users/${id}`, data);
      return res.data.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/users/${id}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post<{ data: { user: User } }>('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useReporterProfile = (id: string) => {
  return useQuery({
    queryKey: ['reporter-profile', id],
    queryFn: async () => {
      const res = await api.get<{ data: { reporter: User; articles: unknown[] } }>(
        `/users/reporters/${id}`
      );
      return res.data.data!;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
