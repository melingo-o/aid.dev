const { cert, getApps, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

function getEnv(name, fallback = "") {
  const value = process.env[name];
  return value === undefined || value === null ? fallback : String(value);
}

function getPrivateKey() {
  const raw = getEnv("FIREBASE_PRIVATE_KEY", "");
  return raw.replace(/\\n/g, "\n");
}

function getFirebaseApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin credentials are not configured.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    }),
    storageBucket: getEnv("FIREBASE_STORAGE_BUCKET", undefined)
  });
}

function getDb() {
  return getFirestore(getFirebaseApp());
}

function getSiteId() {
  return getEnv("AID_SITE_ID", "aid-cheongdam");
}

function getSiteDoc(db) {
  return db.collection("aid_sites").doc(getSiteId());
}

module.exports = {
  getDb,
  getSiteDoc,
  getSiteId
};
