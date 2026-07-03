import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  // TODO: Thay bằng tên miền chính thức của bạn khi có
  const baseUrl = 'https://phim-affiliate-ducs-projects.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // Không cho Google quét trang admin
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
