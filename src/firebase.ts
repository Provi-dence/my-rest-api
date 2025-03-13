import admin from "firebase-admin";
import fs from "fs";

// Read the service account JSON file
const serviceAccount = JSON.parse(fs.readFileSync("./firebase/firebase.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
export { db, admin };
