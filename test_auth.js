const https = require('https');
require('dotenv').config();

const data = JSON.stringify({
  email: process.env.SHIPROCKET_EMAIL,
  password: process.env.SHIPROCKET_PASSWORD
});

const options = {
  hostname: 'apiv2.shiprocket.in',
  path: '/v1/external/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseBody = '';
  res.on('data', d => { responseBody += d; });
  res.on('end', () => {
      console.log(responseBody);
  });
});

req.on('error', error => { console.error(error); });
req.write(data);
req.end();
