import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://styletry.ai';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/demo-store', '/widget/embed'],
        disallow: ['/admin/', '/api/', '/profile', '/history'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
