import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: 'Thiếu URL' }, { status: 400 });

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) throw new Error('Không thể fetch nội dung trang web');
    
    const html = await res.text();
    const $ = cheerio.load(html);

    const links: string[] = [];
    const isMissAV = url.includes('missav');

    if (isMissAV) {
      $('a').each((i, el) => {
        let href = $(el).attr('href');
        if (href) {
          if (href.startsWith('/')) {
            href = new URL(url).origin + href;
          }
          if (href.startsWith('http')) {
            try {
              const urlObj = new URL(href);
              if (urlObj.hostname.includes('missav')) {
                const parts = urlObj.pathname.split('/');
                const slug = parts[parts.length - 1];
                // Lọc ra các link chứa dấu gạch ngang và số (dấu hiệu của mã video AV như mla-274)
                if (slug && slug.includes('-') && /\d/.test(slug)) {
                  links.push(href);
                }
              }
            } catch (e) {}
          }
        }
      });
    } else {
      $('.video-item > a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.startsWith('/video/')) {
          // Tạo URL tuyệt đối dựa trên URL gốc
          const baseUrl = new URL(url).origin;
          links.push(baseUrl + href);
        }
      });
    }

    // Lọc trùng lặp
    const uniqueLinks = [...new Set(links)];

    return NextResponse.json({
      success: true,
      links: uniqueLinks
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi bóc tách dữ liệu' }, { status: 500 });
  }
}
