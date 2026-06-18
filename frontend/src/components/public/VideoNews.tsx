import Link from 'next/link';
import Image from 'next/image';
import { PlayCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Article {
  _id: string;
  title: string;
  slug: string;
  publishDate: string;
  category?: { name: string; color: string };
  featuredImage?: { url: string };
  videoUrl?: string;
}

interface VideoNewsProps {
  articles: Article[];
}

export function VideoNews({ articles }: VideoNewsProps) {
  if (!articles || articles.length === 0) return null;

  const mainVideo = articles[0];
  const sideVideos = articles.slice(1, 4);

  return (
    <section className="my-12 bg-zinc-950 text-white rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-6 w-6 text-news-red" />
          <h2 className="text-2xl font-bold font-serif">Video News</h2>
        </div>
        <Link href="/search?hasVideo=true" className="text-sm font-medium hover:text-news-red transition-colors">
          View All Videos →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video */}
        {mainVideo && (
          <div className="lg:col-span-2">
            <article className="group cursor-pointer">
              <Link href={`/article/${mainVideo.slug}`}>
                <div className="relative aspect-video overflow-hidden rounded-xl mb-4 bg-black">
                  <Image
                    src={mainVideo.featuredImage?.url || '/placeholder.jpg'}
                    alt={mainVideo.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-news-red/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <PlayCircle className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-news-red hover:bg-news-red text-[10px] px-1.5 py-0">
                      {mainVideo.category?.name || 'Video'}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm text-zinc-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(mainVideo.publishDate)}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-2xl leading-tight group-hover:text-news-red transition-colors">
                    {mainVideo.title}
                  </h3>
                </div>
              </Link>
            </article>
          </div>
        )}

        {/* Side Videos */}
        <div className="space-y-6">
          {sideVideos.map((article) => (
            <article key={article._id} className="group cursor-pointer">
              <Link href={`/article/${article.slug}`} className="flex gap-4">
                <div className="relative w-32 h-20 shrink-0 overflow-hidden rounded-lg bg-black">
                  <Image
                    src={article.featuredImage?.url || '/placeholder.jpg'}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="h-6 w-6 text-white/80" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-serif font-bold text-sm leading-tight group-hover:text-news-red transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {formatDate(article.publishDate)}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
