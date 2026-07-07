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

    // Bóc tách dữ liệu
    const isMissAV = url.includes('missav');
    
    let title = '';
    let thumbnail = '';
    let secretCode = '';
    let content = '';
    let actress = '';
    let categories = '';

    if (isMissAV) {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      thumbnail = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
      content = $('meta[property="og:description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || '';
      
      const actors: string[] = [];
      $('meta[property="og:video:actor"]').each((i, el) => {
        const actor = $(el).attr('content');
        if (actor) actors.push(actor);
      });
      actress = actors.join(', ');

      const tags: string[] = [];
      $('meta[property="og:video:tag"]').each((i, el) => {
        const tag = $(el).attr('content');
        if (tag) tags.push(tag);
      });
      categories = tags.join(', ');

      // Lấy secret code từ URL (ví dụ: mla-274)
      const parts = new URL(url).pathname.split('/');
      const slug = parts[parts.length - 1];
      if (slug && slug.includes('-')) {
        secretCode = slug.replace('-uncensored-leak', '').replace('-english-subtitle', '').replace('-chinese-subtitle', '').toUpperCase();
      } else {
        const titleMatch = title.match(/^([a-zA-Z0-9]+-[a-zA-Z0-9]+)/);
        secretCode = titleMatch ? titleMatch[1] : '';
      }
    } else {
      title = $('h1.page-title').text().trim() || $('title').text().replace('- VLXX.COM', '').trim();
      thumbnail = $('meta[property="og:image"]').attr('content') || '';
      secretCode = $('.video-code').text().trim();
      content = $('.video-description').text().trim();
      actress = $('.actress-tag a').map((i, el) => $(el).text()).get().join(', ');
      categories = $('.category-tag a').map((i, el) => $(el).text()).get().join(', ');
    }
    
    let quote = '';
    if (actress) quote += `Diễn viên: ${actress}`;
    if (categories) quote += (quote ? ' - Thể loại: ' : 'Thể loại: ') + categories;
    if (!quote) quote = content;

    return NextResponse.json({
      success: true,
      data: {
        title,
        thumbnail,
        secretCode,
        content: content || title,
        quote
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Lỗi bóc tách dữ liệu' }, { status: 500 });
  }
}
