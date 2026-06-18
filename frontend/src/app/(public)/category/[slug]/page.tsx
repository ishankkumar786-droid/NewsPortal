import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from '@/components/ads/AdBanner';
import Image from 'next/image';
import { Eye, Clock } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getCategory(slug: string) {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/categories/slug/${slug}`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[getCategory] ${res.status} ${res.statusText} — ${url}`);
      return null;
    }
    const data = await res.json();
    return data.data?.category || null;
  } catch (err) {
    console.error('[getCategory] fetch failed:', err);
    return null;
  }
}

async function getCategoryArticles(categoryId: string, page = 1) {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/articles?category=${categoryId}&page=${page}&limit=12&status=published`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.error(`[getCategoryArticles] ${res.status} ${res.statusText} — ${url}`);
      return { articles: [], pagination: null };
    }
    const data = await res.json();
    return {
      articles: data.data?.articles || [],
      pagination: data.pagination,
    };
  } catch (err) {
    console.error('[getCategoryArticles] fetch failed:', err);
    return { articles: [], pagination: null };
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const category = await getCategory(params.slug);
  if (!category) return { title: 'Category Not Found' };
  
  return {
    title: `${category.name} News`,
    description: category.description || `Latest news and updates in ${category.name}`,
  };
}

export default async function CategoryPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const currentPage = Number(searchParams.page) || 1;
  const { articles, pagination } = await getCategoryArticles(category._id, currentPage);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8 border-b pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-8 rounded-sm" style={{ backgroundColor: category.color }} />
          <h1 className="text-4xl font-bold font-serif">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-lg text-muted-foreground ml-7">{category.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: any) => (
                <article key={article._id} className="group cursor-pointer">
                  <Link href={`/article/${article.slug}`}>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3">
                      <Image
                        src={article.featuredImage?.url || '/placeholder.jpg'}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {article.isBreaking && (
                          <Badge className="bg-news-red hover:bg-news-red text-white text-[10px] px-1.5 py-0">Breaking</Badge>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(article.publishDate)}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-news-red transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 pt-8 border-t">
              {pagination.hasPrevPage && (
                <Link href={`/category/${params.slug}?page=${currentPage - 1}`}>
                  <Badge variant="outline" className="px-4 py-2 hover:bg-muted">Previous</Badge>
                </Link>
              )}
              <span className="flex items-center px-4 text-sm font-medium">
                Page {currentPage} of {pagination.totalPages}
              </span>
              {pagination.hasNextPage && (
                <Link href={`/category/${params.slug}?page=${currentPage + 1}`}>
                  <Badge variant="outline" className="px-4 py-2 hover:bg-muted">Next</Badge>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <AdBanner slot="SIDEBAR_TOP" />
          
          <div className="bg-muted p-6 rounded-xl">
            <h3 className="font-serif font-bold text-xl mb-4 border-b pb-2">About Category</h3>
            <p className="text-sm text-muted-foreground">
              Stay up to date with the latest news, analysis, and exclusive reports in the {category.name} sector. Our reporters bring you comprehensive coverage from around the globe.
            </p>
          </div>
          
          <AdBanner slot="SIDEBAR_BOTTOM" />
        </aside>
      </div>
    </div>
  );
}
