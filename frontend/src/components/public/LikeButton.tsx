'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToggleLike } from '@/hooks/useArticles';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn, extractApiError } from '@/lib/utils';

const LIKED_ARTICLES_KEY = 'liked-articles';

function getLikedArticles(): Set<string> {
  try {
    const stored = localStorage.getItem(LIKED_ARTICLES_KEY);
    if (stored) return new Set(JSON.parse(stored));
  } catch {
    // Corrupted data — reset
  }
  return new Set();
}

function setLikedArticles(set: Set<string>) {
  localStorage.setItem(LIKED_ARTICLES_KEY, JSON.stringify([...set]));
}

interface LikeButtonProps {
  articleId: string;
  initialLikeCount: number;
}

export function LikeButton({ articleId, initialLikeCount }: LikeButtonProps) {
  const { mutate: toggleLike, isPending } = useToggleLike();
  const { toast } = useToast();

  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const isLiked = getLikedArticles().has(articleId);
    setHasLiked(isLiked);
    if (isLiked && initialLikeCount === 0) {
      setLikeCount((prev) => (prev === 0 ? 1 : prev));
    }
  }, [articleId, initialLikeCount]);

  useEffect(() => {
    const isLiked = getLikedArticles().has(articleId);
    if (isLiked && initialLikeCount === 0) {
      setLikeCount(1);
    } else {
      setLikeCount(initialLikeCount);
    }
  }, [initialLikeCount, articleId]);

  const handleLike = useCallback(() => {
    const newHasLiked = !hasLiked;
    const direction = newHasLiked ? 'like' : 'unlike';

    // Optimistic update
    setHasLiked(newHasLiked);
    setLikeCount((prev) => (newHasLiked ? prev + 1 : Math.max(0, prev - 1)));

    // Persist to localStorage
    const likedSet = getLikedArticles();
    if (newHasLiked) {
      likedSet.add(articleId);
    } else {
      likedSet.delete(articleId);
    }
    setLikedArticles(likedSet);

    toggleLike(
      { articleId, direction },
      {
        onSuccess: (updatedArticle) => {
          if (updatedArticle && typeof updatedArticle.likeCount === 'number') {
            setLikeCount(updatedArticle.likeCount);
          }
        },
        onError: (err) => {
          // Revert on error
          setHasLiked(!newHasLiked);
          setLikeCount((prev) => (newHasLiked ? Math.max(0, prev - 1) : prev + 1));
          // Revert localStorage
          const revertSet = getLikedArticles();
          if (newHasLiked) {
            revertSet.delete(articleId);
          } else {
            revertSet.add(articleId);
          }
          setLikedArticles(revertSet);
          toast({ variant: 'destructive', title: 'Action failed', description: extractApiError(err) });
        },
      }
    );
  }, [hasLiked, articleId, toggleLike, toast]);

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-2 rounded-full transition-all', hasLiked && 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700')}
      onClick={handleLike}
      disabled={isPending}
    >
      <Heart className={cn('h-4 w-4', hasLiked && 'fill-current')} />
      <span>{likeCount}</span>
    </Button>
  );
}
