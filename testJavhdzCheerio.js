const cheerio = require('cheerio');

async function test() {
  try {
    const url = 'https://javhdz.ws/vo-yeu-da-bi-ga-giao-hang-hiep-mitsuha-chiharu-3947.html';
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    console.log('Title:', $('title').text());
    console.log('og:title:', $('meta[property="og:title"]').attr('content'));
    console.log('og:image:', $('meta[property="og:image"]').attr('content'));
    console.log('og:description:', $('meta[property="og:description"]').attr('content'));
    
    // tags
    const tags = [];
    $('.post-tags a').each((i, el) => {
      tags.push($(el).text());
    });
    console.log('Tags (post-tags):', tags);
    
    const catTags = [];
    $('a[rel="category tag"]').each((i, el) => {
      catTags.push($(el).text());
    });
    console.log('Category tags:', catTags);
  } catch (e) {
    console.error(e);
  }
}
test();
