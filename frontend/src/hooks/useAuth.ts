'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { extractApiError } from '@/lib/utils';
import type { User, LoginFormData, RegisterFormData } from '@/types';

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'reporter' | 'visitor';
    avatar?: string;
  };
  accessToken: string;
}

export const useLogin = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await api.post<{ data: LoginResponse }>('/auth/login', data);
      return res.data.data!;
    },
    onSuccess: (data) => {
      setUser(
        { ...data.user },
        data.accessToken
      );

      // Redirect based on role
      if (data.user.role === 'super_admin') {
        router.push('/admin/dashboard');
      } else if (data.user.role === 'reporter') {
        router.push('/reporter/dashboard');
      } else {
        router.push('/');
      }
    },
  });
};

export const useRegister = () => {
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const { confirmPassword: _, ...registerData } = data;
      const res = await api.post<{ data: LoginResponse }>('/auth/register', registerData);
      return res.data.data!;
    },
    onSuccess: (data) => {
      setUser({ ...data.user }, data.accessToken);
      router.push('/');
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
};

export const useMe = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<{ data: { user: User } }>('/auth/me');
      return res.data.data!.user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post('/auth/forgot-password', { email });
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      token,
      password,
      confirmPassword,
    }: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => {
      await api.post(`/auth/reset-password/${token}`, { password, confirmPassword });
    },
    onSuccess: () => {
      router.push('/auth/login');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      await api.post('/auth/change-password', data);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; bio?: string }) => {
      const res = await api.patch<{ data: { user: User } }>('/auth/me', data);
      return res.data.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post<{ data: { user: User } }>('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data!.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
