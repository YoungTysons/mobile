const https = require('https');

function test(url) {
  console.log(`Testing health check on: ${url} ...`);
  const req = https.get(url, (res) => {
    console.log(`[${url}] Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[${url}] Body:`, data);
    });
  });
  req.on('error', (err) => {
    console.error(`[${url}] Failed:`, err.message);
  });
  req.setTimeout(5000, () => {
    console.warn(`[${url}] Timeout!`);
    req.destroy();
  });
}

test('https://moiiiiiii.onrender.com');
test('https://moiiiiiiii.onrender.com');
