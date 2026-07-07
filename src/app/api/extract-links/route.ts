import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    let { url } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: 'Thiếu URL' }, { status: 400 });
    
    // Đảm bảo URL có giao thức
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    const res = await fetch(url, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      return NextResponse.json({ success: false, error: `Lỗi fetch trang web: ${res.status} ${res.statusText}` }, { status: 500 });
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    const links: string[] = [];
    const isMissAV = url.includes('missav');
    const isJavHDZ = url.includes('javhdz');

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
    } else if (isJavHDZ) {
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('javhdz') && href.endsWith('.html')) {
          links.push(href);
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
