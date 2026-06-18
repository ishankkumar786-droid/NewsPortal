import type { Metadata } from 'next';
import { SearchResults } from '@/components/public/SearchResults';

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  return {
    title: query ? `Search: "${query}"` : 'Search',
    description: query ? `Search results for "${query}"` : 'Search our news archive',
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage(props: PageProps) {
  const searchParams = await props.searchParams;
  return (
    <div className="container mx-auto px-4 py-8">
      <SearchResults
        query={searchParams.q || ''}
        category={searchParams.category}
        page={parseInt(searchParams.page || '1')}
      />
    </div>
  );
}
