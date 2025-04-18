const express = require('express');
const router = express.Router();
const https = require('https');
const fs = require('fs');
const path = require('path');

router.post('/validate', (req, res) => {
  const { validationUrl } = req.body;
  if (!validationUrl) return res.status(400).send('Missing validationUrl');

  const options = {
    method: 'POST',
    key: fs.readFileSync(path.join(__dirname, '../../certs/merchant_id.cer')),
    cert: fs.readFileSync(path.join(__dirname, '../../certs/apple_pay.cer')),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const request = https.request(validationUrl, options, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => {
      try {
        const json = JSON.parse(data);
        res.json(json);
      } catch {
        res.status(500).send('Invalid JSON from Apple');
      }
    });
  });

  request.on('error', (err) => {
    console.error('Merchant validation error:', err);
    res.status(500).send('Merchant validation failed');
  });

  request.write(JSON.stringify({
    merchantIdentifier: process.env.MERCHANT_ID || 'merchant.com.reapwallet',
    displayName: "ReapWallet",
    initiative: "web",
    initiativeContext: "reapwareapi.cc"
  }));

  request.end();
});

module.exports = router;