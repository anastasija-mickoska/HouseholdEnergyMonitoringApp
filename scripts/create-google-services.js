const fs = require('fs');
const path = require('path');

const googleServices = process.env.GOOGLE_SERVICES_JSON;

if (!googleServices) {
  console.error("Missing GOOGLE_SERVICES_JSON environment variable");
  process.exit(1);
}

const filePath = path.join(__dirname, '..', 'android', 'app', 'google-services.json');

fs.writeFileSync(filePath, googleServices);
console.log('google-services.json written to android/app/');
