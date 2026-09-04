import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Newspaper, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Newspaper className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h1 className="text-4xl font-serif font-bold text-foreground mb-2">404 — Article Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        The article you are looking for does not exist, has been removed, or is not yet published.
      </p>
      <Link href="/">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
