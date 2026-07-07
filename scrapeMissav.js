const fs = require('fs');
async function test() {
  const url = 'https://missav.media/vi/mla-274';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  fs.writeFileSync('video.html', html);
  console.log('Saved to video.html');
}
test();
