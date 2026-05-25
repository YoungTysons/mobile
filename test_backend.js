const https = require('https');

console.log('Sending request to: https://moiiiiiii.onrender.com/api/san-pham ...');

const req = https.get('https://moiiiiiii.onrender.com/api/san-pham', (res) => {
  console.log(`Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Response length:', data.length);
    console.log('Response body:', data.substring(0, 500));
  });
});

req.on('error', (err) => {
  console.error('Request failed with error:', err.message);
});

req.setTimeout(10000, () => {
  console.warn('Request timed out after 10 seconds!');
  req.destroy();
});
