const fs = require('fs');
async function test() {
  const url = 'https://javhdz.ws/vo-yeu-da-bi-ga-giao-hang-hiep-mitsuha-chiharu-3947.html';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html = await res.text();
  fs.writeFileSync('javhdz2.html', html);
  console.log('Saved to javhdz2.html');
}
test();
