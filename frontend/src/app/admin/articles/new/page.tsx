import type { Metadata } from 'next';
import { ArticleForm } from '@/components/reporter/editor/ArticleForm';

export const metadata: Metadata = {
  title: 'Write New Article | Admin',
  robots: { index: false },
};

export default function AdminNewArticlePage() {
  return (
    <div className="p-6">
      <ArticleForm isAdmin={true} />
    </div>
  );
}
