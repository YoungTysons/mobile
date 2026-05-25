const https = require('https');

const data = JSON.stringify({
  message: 'Hello, bạn có cây sen đá không?',
  history: []
});

const options = {
  hostname: 'moiiiiiii.onrender.com',
  port: 443,
  path: '/api/chatbot/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending request to chatbot on Render...');

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (err) => {
  console.error('Request failed:', err.message);
});

req.write(data);
req.end();
