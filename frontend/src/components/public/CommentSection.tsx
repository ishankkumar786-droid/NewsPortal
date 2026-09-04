'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useGetComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, LogIn, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { extractApiError } from '@/lib/utils';
import Image from 'next/image';

export function CommentSection({ articleId }: { articleId: string }) {
  const { user, isAuthenticated, accessToken, isHydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const { data: comments, isLoading } = useGetComments(articleId);
  const { mutate: addComment, isPending: isAdding } = useAddComment();
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment();
  const { toast } = useToast();
  const [content, setContent] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && isHydrated && Boolean(isAuthenticated && user && accessToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isLoggedIn) {
      toast({ variant: 'destructive', title: 'Login required', description: 'Please login to leave a comment.' });
      return;
    }

    addComment(
      { articleId, content },
      {
        onSuccess: () => {
          setContent('');
          toast({ title: 'Comment added successfully' });
        },
        onError: (err) => {
          toast({ variant: 'destructive', title: 'Failed to add comment', description: extractApiError(err) });
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    deleteComment(
      { articleId, commentId },
      {
        onSuccess: () => toast({ title: 'Comment deleted' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Delete failed', description: extractApiError(err) }),
      }
    );
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Comments ({comments?.length || 0})</h3>
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isAdding || !content.trim()}>
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-border/60 bg-muted/40 p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Join the conversation! You must be logged in to leave a comment.
          </p>
          <div>
            <Button asChild size="sm" className="gap-2">
              <Link href="/auth/login">
                <LogIn className="h-4 w-4" />
                <span>Log In to Comment</span>
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => {
          const commentUserId = comment.user?._id || (comment.user as any)?.id;
          const isAuthor = Boolean(user?.id && commentUserId && String(commentUserId) === String(user.id));
          const isAdmin = user?.role === 'super_admin';
          const canDelete = isAuthor || isAdmin;

          return (
            <div key={comment._id} className="flex gap-4 p-4 rounded-lg bg-muted/30">
              {comment.user.avatar ? (
                <Image
                  src={comment.user.avatar}
                  alt={comment.user.name || ''}
                  width={40}
                  height={40}
                  className="rounded-full flex-shrink-0 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {comment.user.name?.[0]}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{comment.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      disabled={isDeleting}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      aria-label="Delete comment"
                      title={isAdmin && !isAuthor ? 'Delete comment (Admin)' : 'Delete your comment'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap mt-2">{comment.content}</p>
              </div>
            </div>
          );
        })}
        {comments?.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
}
