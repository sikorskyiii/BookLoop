import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey?.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey } as admin.ServiceAccount)
  });
      console.log("Firebase Admin initialized successfully");
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error);
    }
  } else {
    console.warn("Firebase Admin is not configured. Missing environment variables:");
    if (!projectId) console.warn("  - FIREBASE_PROJECT_ID");
    if (!clientEmail) console.warn("  - FIREBASE_CLIENT_EMAIL");
    if (!privateKey) console.warn("  - FIREBASE_PRIVATE_KEY");
    console.warn("Google OAuth login will not work without these variables.");
  }
}

export { admin };

