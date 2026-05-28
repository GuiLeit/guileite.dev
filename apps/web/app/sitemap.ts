import type { MetadataRoute } from 'next';
import { locales } from '../i18n';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://guileite.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/projects'];
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : 0.8,
    }))
  );
}
