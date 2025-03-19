import admin from "firebase-admin";
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccount = require("./firebase/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();
export { db };
