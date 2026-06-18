import type { Metadata } from 'next';
import { BreakingNewsTicker } from '@/components/public/BreakingNewsTicker';
import { HeroSection } from '@/components/public/HeroSection';
import { LatestNews } from '@/components/public/LatestNews';
import { CategorySection } from '@/components/public/CategorySection';
import { TrendingNews } from '@/components/public/TrendingNews';
import { VideoNews } from '@/components/public/VideoNews';
import { PhotoGallery } from '@/components/public/PhotoGallery';
import { AdBanner } from '@/components/ads/AdBanner';
import { GoogleAdSense } from '@/components/ads/GoogleAdSense';

async function getArticles(params: string) {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/articles?${params}`;
    const res = await fetch(url, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });
    if (!res.ok) {
      console.error(`[getArticles] ${res.status} ${res.statusText} — ${url}`);
      return [];
    }
    const data = await res.json();
    return data.data?.articles || [];
  } catch (err) {
    console.error('[getArticles] fetch failed:', err);
    return [];
  }
}

async function getBreakingArticles(params: string) {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/articles?${params}`;
    const res = await fetch(url, {
      next: { revalidate: 60 }, // Breaking news revalidates every 1 minute
    });
    if (!res.ok) {
      console.error(`[getBreakingArticles] ${res.status} ${res.statusText} — ${url}`);
      return [];
    }
    const data = await res.json();
    return data.data?.articles || [];
  } catch (err) {
    console.error('[getBreakingArticles] fetch failed:', err);
    return [];
  }
}

async function getCategories() {
  try {
    const url = `${process.env.SERVER_API_URL || 'http://localhost:5000/api/v1'}/categories`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[getCategories] ${res.status} ${res.statusText} — ${url}`);
      return [];
    }
    const data = await res.json();
    return data.data?.categories || [];
  } catch (err) {
    console.error('[getCategories] fetch failed:', err);
    return [];
  }
}

export default async function HomePage() {
  const [
    breakingNews,
    featuredArticles,
    latestArticles,
    trendingArticles,
    videoArticles,
    categories
  ] = await Promise.all([
    getBreakingArticles('isBreaking=true&limit=5&status=published'),
    getArticles('isFeatured=true&limit=5&status=published'),
    getArticles('limit=10&status=published'),
    getArticles('sortBy=viewCount&limit=4&status=published'),
    getArticles('hasVideo=true&limit=4&status=published'),
    getCategories()
  ]);

  // Map categories by name for easy access
  const catMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.name.toLowerCase()] = cat;
    return acc;
  }, {});

  return (
    <>
      <BreakingNewsTicker />
      
      <main className="container mx-auto px-4 py-8">
        <AdBanner slot="HOME_TOP" className="mb-8" />
        
        <HeroSection articles={featuredArticles} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* Main Content Column (Left - 2/3) */}
          <div className="lg:col-span-2 space-y-12">
            <TrendingNews articles={trendingArticles} />
            <LatestNews />
            
            <GoogleAdSense slot="HOME_MIDDLE_ADSENSE" className="my-8" />

            <CategorySection categorySlug="politics" label="Politics" />
            <CategorySection categorySlug="technology" label="Technology" />
          </div>
          
          {/* Sidebar Column (Right - 1/3) */}
          <aside className="space-y-8">
            <AdBanner slot="SIDEBAR_TOP" />
            
            <CategorySection categorySlug="business" label="Business" />
            <CategorySection categorySlug="entertainment" label="Entertainment" />

            <GoogleAdSense slot="SIDEBAR_ADSENSE" />
            
            <CategorySection categorySlug="crime" label="Crime" />
          </aside>
        </div>
        {/* Full width sections below */}
        <VideoNews articles={videoArticles} />
        
        <AdBanner slot="HOME_BOTTOM" className="my-8" />
        
        <div className="mt-12">
          <CategorySection categorySlug="sports" label="Sports" />
        </div>

        <div className="mt-12">
          <CategorySection categorySlug="others" label="Others" />
        </div>

        <PhotoGallery articles={latestArticles.filter((a: any) => a.featuredImage?.url)} />
        <GoogleAdSense slot="FOOTER_ADSENSE" className="mt-4" />
      </main>
    </>
  );
}
