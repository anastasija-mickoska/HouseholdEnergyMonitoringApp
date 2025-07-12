const admin = require('firebase-admin');
const serviceAccount = require('../householdenergymonitoringapp-firebase-adminsdk-fbsvc-b7ab9cb89b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
