const cheerio = require('cheerio');

async function autoAdd() {
  console.log('Đang cào dữ liệu từ trang chủ vlxx.moi...');
  const res = await fetch('https://vlxx.moi/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const links = [];
  $('.video-item > a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('/video/')) {
      links.push('https://vlxx.moi' + href);
    }
  });
  
  // Xóa trùng lặp và lấy 5 link đầu tiên
  const uniqueLinks = [...new Set(links)].slice(0, 5);
  console.log(`Tìm thấy ${uniqueLinks.length} link. Bắt đầu trích xuất...\n`);
  
  for (const url of uniqueLinks) {
    console.log('-> Đang trích xuất:', url);
    const detailRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    if (!detailRes.ok) {
      console.log('   [Lỗi] Không thể fetch');
      continue;
    }
    
    const detailHtml = await detailRes.text();
    const $detail = cheerio.load(detailHtml);
    
    const title = $detail('h1.page-title').text().trim() || $detail('title').text().replace('- VLXX.COM', '').trim();
    const thumbnail = $detail('meta[property="og:image"]').attr('content') || '';
    const secretCode = $detail('.video-code').text().trim() || 'NO_CODE';
    const content = $detail('.video-description').text().trim();
    
    const actress = $detail('.actress-tag a').map((i, el) => $detail(el).text()).get().join(', ');
    const categories = $detail('.category-tag a').map((i, el) => $detail(el).text()).get().join(', ');
    
    let quote = '';
    if (actress) quote += `Diễn viên: ${actress}`;
    if (categories) quote += (quote ? ' - Thể loại: ' : 'Thể loại: ') + categories;
    if (!quote) quote = content;
    
    const payload = {
      title,
      thumbnail,
      quote: quote || title,
      content: content || title,
      secretCode,
      affiliateLink: 'https://shopee.vn/search?keyword=do%20ngu%20goi%20cam',
    };
    
    const addRes = await fetch('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const addData = await addRes.json();
    if (addData.success) {
      console.log('   [OK] Đã thêm thành công vào Supabase!');
    } else {
      console.log('   [Lỗi DB]', addData.error);
    }
  }
  console.log('\nHoàn tất!');
}

autoAdd();
