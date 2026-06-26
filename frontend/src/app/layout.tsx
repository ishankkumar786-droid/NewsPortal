import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Khabarpath — Breaking News & Latest Updates',
    template: '%s | Khabarpath',
  },
  description:
    'Get the latest breaking news, top headlines, and in-depth coverage of politics, business, sports, technology, and more.',
  keywords: ['news', 'breaking news', 'latest news', 'headlines', 'politics', 'business', 'sports'],
  authors: [{ name: 'Khabarpath' }],
  creator: 'Khabarpath',
  publisher: 'Khabarpath',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://newsportal.com',
    siteName: 'Khabarpath',
    title: 'Khabarpath — Breaking News & Latest Updates',
    description: 'Get the latest breaking news, top headlines, and in-depth coverage.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Khabarpath',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khabarpath — Breaking News & Latest Updates',
    description: 'Get the latest breaking news and headlines.',
    creator: '@newsportal',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
