import type { Metadata } from 'next';
import { ArticleForm } from '@/components/reporter/editor/ArticleForm';

export const metadata: Metadata = {
  title: 'Write New Article',
  robots: { index: false },
};

export default function NewArticlePage() {
  return (
    <div className="p-6">
      <ArticleForm />
    </div>
  );
}
