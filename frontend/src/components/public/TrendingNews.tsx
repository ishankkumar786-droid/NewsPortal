import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Article {
  _id: string;
  title: string;
  slug: string;
  publishDate: string;
  category?: { name: string; color: string };
  featuredImage?: { url: string };
  viewCount?: number;
}

interface TrendingNewsProps {
  articles: Article[];
}

export function TrendingNews({ articles }: TrendingNewsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <TrendingUp className="h-6 w-6 text-news-red" />
        <h2 className="text-2xl font-bold font-serif">Trending Now</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {articles.slice(0, 4).map((article, index) => (
          <article key={article._id} className="group cursor-pointer">
            <Link href={`/article/${article.slug}`}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3">
                <Image
                  src={article.featuredImage?.url || '/placeholder.jpg'}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 bg-news-red text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                  #{index + 1}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0"
                    style={article.category?.color ? { backgroundColor: `${article.category.color}20`, color: article.category.color } : {}}
                  >
                    {article.category?.name || 'News'}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(article.publishDate)}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base leading-tight group-hover:text-news-red transition-colors line-clamp-3">
                  {article.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
