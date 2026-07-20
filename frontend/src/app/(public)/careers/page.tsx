import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers - Khabarpath',
  description: 'Join the Khabarpath team. Explore career opportunities in journalism and technology.',
};

export default function CareersPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-news-red/10 text-news-red mb-8">
          <Briefcase className="h-10 w-10" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">Careers at Khabarpath</h1>
        <p className="text-lg text-muted-foreground mb-4 max-w-lg mx-auto">
          We&apos;re building the future of news in India. Career opportunities are coming soon.
        </p>

        <div className="inline-block bg-muted rounded-2xl px-8 py-4 mt-4">
          <p className="text-2xl font-bold font-serif text-news-red mb-1">Coming Soon</p>
          <p className="text-sm text-muted-foreground">
            We&apos;re preparing exciting opportunities. Stay tuned!
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-10">
          In the meantime, send your resume to{' '}
          <a href="mailto:birendrakesarwani4005@gmail.com" className="text-news-red hover:underline font-medium">
            birendrakesarwani4005@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
