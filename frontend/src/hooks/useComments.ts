'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Comment } from '@/types';

export const useGetComments = (articleId: string) => {
  return useQuery({
    queryKey: ['comments', articleId],
    queryFn: async () => {
      const res = await api.get<{ data: { comments: Comment[] } }>(`/articles/${articleId}/comments`);
      return res.data.data!.comments;
    },
    enabled: !!articleId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, content }: { articleId: string; content: string }) => {
      const res = await api.post<{ data: { comment: Comment } }>(`/articles/${articleId}/comments`, {
        content,
      });
      return res.data.data!.comment;
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, commentId }: { articleId: string; commentId: string }) => {
      await api.delete(`/articles/${articleId}/comments/${commentId}`);
    },
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
};
