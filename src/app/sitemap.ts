import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://bandmatch.jp', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://bandmatch.jp/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://bandmatch.jp/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://bandmatch.jp/matching', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://bandmatch.jp/events', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://bandmatch.jp/bands', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://bandmatch.jp/community', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  ];
}
