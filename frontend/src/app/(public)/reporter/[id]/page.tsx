import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, MapPin } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getReporter(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/users/reporters/${id}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getReporter(params.id);
  if (!data?.reporter) return { title: 'Reporter Not Found' };
  
  return {
    title: `${data.reporter.name} - Reporter Profile`,
    description: data.reporter.bio || `Read articles by ${data.reporter.name}`,
  };
}

export default async function ReporterProfilePage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const data = await getReporter(params.id);
  if (!data?.reporter) notFound();

  const { reporter, articles, totalArticles } = data;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Profile Header */}
      <div className="bg-muted rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative w-32 h-32 rounded-full overflow-hidden shrink-0 border-4 border-background shadow-lg">
          {reporter.avatar ? (
            <Image src={reporter.avatar} alt={reporter.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-4xl font-bold">
              {reporter.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-bold font-serif">{reporter.name}</h1>
            <p className="text-news-red font-medium">Senior Reporter</p>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            {reporter.bio || `${reporter.name} is a dedicated reporter covering various topics for KhabarPatra, bringing insightful journalism to our readers.`}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            {reporter.email && (
              <a href={`mailto:${reporter.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                <Mail className="h-4 w-4" /> {reporter.email}
              </a>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Joined {formatDate(reporter.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> {totalArticles || articles?.length || 0} Articles
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div>
        <h2 className="text-2xl font-bold font-serif mb-6 border-b pb-2">Latest from {reporter.name.split(' ')[0]}</h2>
        
        {(!articles || articles.length === 0) ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>This reporter hasn't published any articles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {article.category?.name || 'News'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.publishDate)}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-news-red transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary component for icon missing import above
function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
