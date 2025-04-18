const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { execSync } = require('child_process');
const AdmZip = require('adm-zip');

router.get('/generatePass', (req, res) => {
  const passData = {
    description: "ReapWallet Pass",
    formatVersion: 1,
    organizationName: "ReapWallet",
    passTypeIdentifier: process.env.PASS_TYPE_ID || "pass.cc.reapwareapi",
    serialNumber: crypto.randomUUID(),
    teamIdentifier: process.env.TEAM_ID || "YN229FU2KK",
    backgroundColor: "rgb(255,255,255)",
    labelColor: "rgb(0,0,0)",
    logoText: "ReapWallet",
    generic: {
      primaryFields: [{ key: "kban", label: "K/BAN", value: "GB2790S429M7841419Q8836204" }]
    }
  };

  const passFolder = path.join(__dirname, 'pass');
  const passJSON = path.join(passFolder, 'pass.json');
  const outputPass = path.join(__dirname, '../public/ReapWallet.pkpass');

  fs.mkdirSync(passFolder, { recursive: true });
  fs.writeFileSync(passJSON, JSON.stringify(passData, null, 2));
  fs.copyFileSync(path.join(__dirname, '../assets/icon.png'), path.join(passFolder, 'icon.png'));
  fs.copyFileSync(path.join(__dirname, '../assets/icon.png'), path.join(passFolder, 'icon@2x.png'));

  const wwdr = path.join(__dirname, '../certs/wwdr.pem');
  const signCert = path.join(__dirname, '../certs/signingCert.pem');
  const signKey = path.join(__dirname, '../certs/signingKey.pem');

  try {
    execSync(`openssl smime -binary -sign -certfile "${wwdr}" -signer "${signCert}" -inkey "${signKey}" -in "${passJSON}" -out "${passFolder}/signature" -outform DER`);

    const zip = new AdmZip();
    zip.addLocalFile(passJSON);
    zip.addLocalFile(path.join(passFolder, 'icon.png'));
    zip.addLocalFile(path.join(passFolder, 'icon@2x.png'));
    zip.addLocalFile(path.join(passFolder, 'signature'));
    zip.writeZip(outputPass);

    res.download(outputPass);
  } catch (err) {
    console.error("Error generating pass:", err);
    res.status(500).send("Error generating pass");
  }
});

module.exports = router;