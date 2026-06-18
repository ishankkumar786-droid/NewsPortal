import type { Metadata } from 'next';
import { MyArticlesList } from '@/components/reporter/MyArticlesList';

export const metadata: Metadata = {
  title: 'My Articles',
  robots: { index: false, follow: false },
};

export default function MyArticlesPage() {
  return <MyArticlesList />;
}
