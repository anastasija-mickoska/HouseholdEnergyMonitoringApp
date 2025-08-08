const fs = require('fs');
const path = require('path');

const googleServicesBase64 = process.env.GOOGLE_SERVICES_JSON;

if (!googleServicesBase64) {
  console.error('Missing GOOGLE_SERVICES_JSON env variable');
  process.exit(1);
}

const decoded = Buffer.from(googleServicesBase64, 'base64').toString('utf-8');

const targetPath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');

fs.writeFileSync(targetPath, decoded);

console.log('google-services.json created');