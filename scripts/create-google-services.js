const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, 'secrets', 'google-services.json');
const dest = path.join(__dirname, '..', 'android', 'app', 'google-services.json');

if (!fs.existsSync(source)) {
  console.error('google-services.json not found in secrets folder.');
  process.exit(1);
}

fs.copyFileSync(source, dest);
console.log('Copied google-services.json to android/app folder');
