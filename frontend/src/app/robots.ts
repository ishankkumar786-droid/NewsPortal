import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://khabarpath.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/article/', '/category/', '/search', '/about', '/contact'],
        disallow: [
          '/admin/',
          '/reporter/',
          '/auth/',
          '/api/',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/reporter/', '/auth/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
