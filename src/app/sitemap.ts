import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // TODO: Thay bằng tên miền chính thức của bạn khi có (ví dụ: https://phim-affiliate.com)
  const baseUrl = 'https://phim-affiliate-ducs-projects.vercel.app';
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('slug, created_at');

  const reviewUrls = (reviews || []).map((review) => ({
    url: `${baseUrl}/${review.slug}`,
    lastModified: new Date(review.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...reviewUrls,
  ];
}
