
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/validate-merchant', (req, res) => {
  const { validationURL } = req.body;
  const options = {
    method: 'POST',
    key: fs.readFileSync(path.join(__dirname, '../certs/signingKey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/signingCert.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../certs/wwdr.pem')),
    headers: { 'Content-Type': 'application/json' }
  };

  const postData = JSON.stringify({
    merchantIdentifier: process.env.MERCHANT_ID,
    displayName: process.env.DISPLAY_NAME,
    initiative: 'web',
    initiativeContext: process.env.DOMAIN
  });

  const request = require('https').request(validationURL, options, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => res.json(JSON.parse(data)));
  });

  request.on('error', (e) => res.status(500).send(e.message));
  request.write(postData);
  request.end();
});

module.exports = app;
