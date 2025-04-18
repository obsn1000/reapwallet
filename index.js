
const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

app.post('/api/validate-merchant', (req, res) => {
  const { validationURL } = req.body;
  const options = {
    method: 'POST',
    key: fs.readFileSync(path.join(__dirname, 'certs', 'signingKey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'signingCert.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'certs', 'wwdr.pem')),
    headers: { 'Content-Type': 'application/json' }
  };

  const postData = JSON.stringify({
    merchantIdentifier: process.env.MERCHANT_ID,
    displayName: process.env.DISPLAY_NAME,
    initiative: 'web',
    initiativeContext: process.env.DOMAIN
  });

  const request = https.request(validationURL, options, (response) => {
    let data = '';
    response.on('data', chunk => (data += chunk));
    response.on('end', () => res.json(JSON.parse(data)));
  });

  request.on('error', (e) => res.status(500).send(e.message));
  request.write(postData);
  request.end();
});

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'certs', 'signingKey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'signingCert.pem'))
}, app).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTPS Server running on https://0.0.0.0:${PORT}`);
});
