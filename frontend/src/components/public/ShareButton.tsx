'use client';

import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing', error);
        }
      }
    } else {
      // Fallback if Web Share API is not supported (e.g., older desktop browsers)
      // We can just copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-6 py-2.5 bg-news-red text-white rounded-full text-sm font-medium hover:bg-news-red/90 transition-colors shadow-sm"
      aria-label="Share article"
    >
      <Share2 className="h-4 w-4" />
      Share Article
    </button>
  );
}
