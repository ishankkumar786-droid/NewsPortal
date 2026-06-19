import type { Metadata } from 'next';
import { ArticleView } from '@/components/public/ArticleView';
import { ArticleClientPreview } from '@/components/public/ArticleClientPreview';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Server-side data fetching for SEO
async function getArticle(slug: string) {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/articles/slug/${slug}`;
    const res = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`[getArticle] ${res.status} ${res.statusText} — ${url}`);
      }
      return null;
    }

    const data = await res.json();
    return data.data?.article || null;
  } catch (err) {
    console.error('[getArticle] fetch failed:', err);
    return null;
  }
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsportal.com';
  const articleUrl = `${siteUrl}/article/${article.slug}`;
  const imageUrl = article.featuredImage?.url;

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    keywords: article.tags,
    authors: [{ name: article.author?.name }],
    alternates: {
      canonical: article.canonicalUrl || articleUrl,
    },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      url: articleUrl,
      type: 'article',
      publishedTime: article.publishDate,
      modifiedTime: article.updatedAt,
      authors: [article.author?.name],
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: article.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage(props: PageProps) {
  const params = await props.params;
  const article = await getArticle(params.slug);

  // The server-side fetch only returns published articles (no auth context here).
  // Fall back to a client-side preview so admins/authors can view non-published
  // articles (e.g. after approving but before publishing).
  if (!article) {
    return <ArticleClientPreview slug={params.slug} />;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://newsportal.com';
  const articleUrl = `${siteUrl}/article/${article.slug}`;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.featuredImage?.url ? [article.featuredImage.url] : [],
    datePublished: article.publishDate,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author?.name,
      url: `${siteUrl}/reporter/${article.author?._id}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KhabarPatra',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.category?.name,
    keywords: article.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ArticleView article={article} articleUrl={articleUrl} />
    </>
  );
}
