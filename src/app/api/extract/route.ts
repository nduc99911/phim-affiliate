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
    const title = $('h1.page-title').text().trim() || $('title').text().replace('- VLXX.COM', '').trim();
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';
    const secretCode = $('.video-code').text().trim();
    const content = $('.video-description').text().trim();

    // Lấy tags & diễn viên
    const actress = $('.actress-tag a').map((i, el) => $(el).text()).get().join(', ');
    const categories = $('.category-tag a').map((i, el) => $(el).text()).get().join(', ');
    
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
