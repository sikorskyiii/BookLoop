import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey?.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

if (!admin.apps.length && projectId && clientEmail && privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey } as admin.ServiceAccount)
    });
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error);
  }
}

export { admin };

