const http = require('http');

const data = JSON.stringify({
  message: 'Hello, bạn có cây sen đá không?',
  history: []
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chatbot/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Sending request to local chatbot...');

const req = http.request(options, (res) => {
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
