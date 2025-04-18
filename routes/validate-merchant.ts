import https from 'https';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { validationURL } = req.body;

  const options = {
    method: 'POST',
    key: fs.readFileSync(path.join(process.cwd(), 'certs/signingKey.pem')),
    cert: fs.readFileSync(path.join(process.cwd(), 'certs/signingCert.pem')),
    ca: fs.readFileSync(path.join(process.cwd(), 'certs/wwdr.pem')),
    headers: { 'Content-Type': 'application/json' }
  };

  const postData = JSON.stringify({
    merchantIdentifier: 'merchant.reapwarewallet',
    displayName: 'ReapWallet',
    initiative: 'web',
    initiativeContext: 'reapwareapi.cc'
  });

  const request = https.request(validationURL, options, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => {
      res.json(JSON.parse(data));
    });
  });

  request.on('error', (e) => res.status(500).send(e.message));
  request.write(postData);
  request.end();
}
