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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) throw new Error('Không thể fetch nội dung trang web');
    
    const html = await res.text();
    const $ = cheerio.load(html);

    // Bóc tách dữ liệu
    const isMissAV = url.includes('missav');
    const isJavHDZ = url.includes('javhdz');
    
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
    } else if (isJavHDZ) {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      thumbnail = $('meta[property="og:image"]').attr('content') || '';
      content = $('meta[property="og:description"]').attr('content') || '';

      const codeMatch = content.match(/\[([a-zA-Z0-9]+-[0-9]+)\]/) || title.match(/\[([a-zA-Z0-9]+-[0-9]+)\]/);
      if (codeMatch) {
        secretCode = codeMatch[1];
      } else {
        const urlMatch = url.match(/-([0-9]+)\.html$/);
        if (urlMatch) {
          secretCode = urlMatch[1];
        }
      }

      const tags: string[] = [];
      $('a[rel="tag"]').each((i, el) => {
        tags.push($(el).text());
      });
      categories = tags.join(', ');
      // javhdz thường đưa tên diễn viên vào tag hoặc tiêu đề, để trống để người dùng tự nhập hoặc regex từ tags
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
