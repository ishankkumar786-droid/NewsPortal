import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AdBanner } from '@/components/ads/AdBanner';
import { GoogleAdSense } from '@/components/ads/GoogleAdSense';
import { Eye, Clock, Share2, Twitter, Facebook } from 'lucide-react';

// Minimal shape of the article fields this component reads.
interface ArticleViewArticle {
  _id?: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status?: string;
  tags?: string[];
  viewCount?: number;
  publishDate?: string;
  isBreaking?: boolean;
  category?: { name: string; slug: string; color: string } | null;
  author?: {
    _id?: string;
    name?: string;
    avatar?: string;
    bio?: string;
  } | null;
  featuredImage?: {
    url?: string;
    alt?: string;
    caption?: string;
  } | null;
}

interface ArticleViewProps {
  article: ArticleViewArticle;
  articleUrl: string;
  isPreview?: boolean;
}

export function ArticleView({ article, articleUrl, isPreview = false }: ArticleViewProps) {
  return (
    <article
      className="container mx-auto px-4 py-8"
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <div className="max-w-3xl mx-auto">
        {/* Preview notice (non-published articles viewed by admins/authors) */}
        {isPreview && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span>
              <strong>Preview mode</strong> — this article is{' '}
              <span className="font-medium">{article.status || 'not published'}</span> and is only
              visible to you. It won&rsquo;t appear publicly until published.
            </span>
          </div>
        )}

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground" role="list">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>›</li>
            {article.category && (
              <>
                <li>
                  <Link href={`/category/${article.category.slug}`} className="hover:text-foreground">
                    {article.category.name}
                  </Link>
                </li>
                <li aria-hidden>›</li>
              </>
            )}
            <li className="text-foreground truncate max-w-xs" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Category & Tags */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {article.category && (
            <Link href={`/category/${article.category.slug}`}>
              <Badge
                className="text-sm font-bold"
                style={{ backgroundColor: article.category.color, color: 'white' }}
              >
                {article.category.name}
              </Badge>
            </Link>
          )}
          {article.isBreaking && <Badge className="bg-news-red text-white">🔴 Breaking</Badge>}
        </div>

        {/* Title */}
        <h1
          className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4"
          itemProp="headline"
        >
          {article.title}
        </h1>

        {/* Summary */}
        <p className="text-lg text-muted-foreground mb-6 leading-relaxed" itemProp="description">
          {article.summary}
        </p>

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-4 py-4 border-y mb-6">
          <div className="flex items-center gap-2">
            {article.author?.avatar ? (
              <Image
                src={article.author.avatar}
                alt={article.author.name || ''}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                {article.author?.name?.[0]}
              </div>
            )}
            <div>
              <Link
                href={`/reporter/${article.author?._id}`}
                className="text-sm font-semibold hover:text-news-red"
                itemProp="author"
              >
                {article.author?.name}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground ml-auto flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <time dateTime={article.publishDate} itemProp="datePublished">
                {article.publishDate ? formatDate(article.publishDate) : ''}
              </time>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.viewCount?.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImage?.url && (
          <figure
            className="mb-6"
            itemProp="image"
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                itemProp="url"
              />
            </div>
            {article.featuredImage.caption && (
              <figcaption className="text-sm text-muted-foreground text-center mt-2">
                {article.featuredImage.caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Content */}
        <AdBanner slot="ARTICLE_TOP" className="mb-6" />

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
          itemProp="articleBody"
        />

        {/* Mid-article Ad */}
        <GoogleAdSense slot="ARTICLE_MIDDLE_ADSENSE" className="my-8" />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share this article
          </p>
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                article.title
              )}&url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm hover:bg-[#1a91da] transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#4267B2] text-white rounded-lg text-sm hover:bg-[#365899] transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </a>
          </div>
        </div>

        {/* Author Bio */}
        {article.author?.bio && (
          <div className="mt-8 p-6 bg-muted rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {article.author.avatar ? (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name || ''}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center">
                  {article.author.name?.[0]}
                </div>
              )}
              <div>
                <p className="font-semibold">{article.author.name}</p>
                <p className="text-xs text-muted-foreground">Reporter</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{article.author.bio}</p>
            <Link
              href={`/reporter/${article.author._id}`}
              className="text-sm text-news-red hover:underline mt-2 inline-block"
            >
              View all articles →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
