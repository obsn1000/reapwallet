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

app.use('/api/merchant', require('./api/merchant/validate'));
app.use('/routes', require('./routes/kban'));
app.use('/routes', require('./routes/merchant'));

const certOptions = {
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'apple_pay.cer')),
  key: fs.readFileSync(path.join(__dirname, 'certs', 'merchant_id.cer'))
};

https.createServer(certOptions, app).listen(PORT, () => {
  console.log(`✅ HTTPS Server running on https://localhost:${PORT}`);
});