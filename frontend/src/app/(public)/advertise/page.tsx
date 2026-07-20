import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, Mail, Phone, BarChart3, Globe, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Advertise With Us - Khabarpath',
  description: 'Reach millions of engaged readers. Partner with Khabarpath for impactful advertising.',
};

export default function AdvertisePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-news-red/10 text-news-red mb-6">
          <Megaphone className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Advertise With Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Ready to reach a large, engaged audience? Partner with Khabarpath to showcase your brand to thousands of daily readers across India.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-muted rounded-2xl p-6 text-center">
          <Users className="h-8 w-8 text-news-red mx-auto mb-3" />
          <p className="text-3xl font-bold font-serif">600+</p>
          <p className="text-sm text-muted-foreground mt-1">Active Weekly Readers</p>
        </div>
        <div className="bg-muted rounded-2xl p-6 text-center">
          <BarChart3 className="h-8 w-8 text-news-red mx-auto mb-3" />
          <p className="text-3xl font-bold font-serif">2.9K+</p>
          <p className="text-sm text-muted-foreground mt-1">Weekly Events</p>
        </div>
        <div className="bg-muted rounded-2xl p-6 text-center">
          <Globe className="h-8 w-8 text-news-red mx-auto mb-3" />
          <p className="text-3xl font-bold font-serif">80+</p>
          <p className="text-sm text-muted-foreground mt-1">Published Articles</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-muted rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold font-serif mb-4">Ready to Advertise?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          We offer a variety of advertising solutions including display ads, sponsored content, and newsletter sponsorships. Contact us today to discuss how we can help you reach your target audience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-news-red text-white font-semibold hover:bg-news-red/90 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Contact Us
          </Link>
          <a
            href="tel:+919936027719"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
          >
            <Phone className="h-4 w-4" />
            +91 9936027719
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          Or email us directly at{' '}
          <a href="mailto:birendrakesarwani4005@gmail.com" className="text-news-red hover:underline font-medium">
            birendrakesarwani4005@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
