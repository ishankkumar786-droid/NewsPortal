import Link from 'next/link';
import Image from 'next/image';
import { Camera } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  slug: string;
  featuredImage?: { url: string; caption?: string };
}

interface PhotoGalleryProps {
  articles: Article[];
}

export function PhotoGallery({ articles }: PhotoGalleryProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-12">
      <div className="flex items-center gap-2 mb-6 border-b pb-2">
        <Camera className="h-6 w-6 text-news-red" />
        <h2 className="text-2xl font-bold font-serif">In Pictures</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {articles.slice(0, 8).map((article, index) => {
          // Make the first and 4th images larger
          const isLarge = index === 0 || index === 3;
          
          return (
            <Link 
              key={article._id} 
              href={`/article/${article.slug}`}
              className={`group relative overflow-hidden rounded-xl block ${isLarge ? 'col-span-2 row-span-2 aspect-[4/3] md:aspect-auto' : 'aspect-square'}`}
            >
              <Image
                src={article.featuredImage?.url || '/placeholder.jpg'}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                <Camera className="h-4 w-4 text-white/70 mb-2" />
                <h3 className={`font-serif font-bold text-white leading-tight line-clamp-2 ${isLarge ? 'text-xl' : 'text-sm'}`}>
                  {article.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
