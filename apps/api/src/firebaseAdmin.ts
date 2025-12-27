import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Завантажуємо .env з корневої директорії API (якщо ще не завантажено)
// Спочатку намагаємося завантажити з поточної робочої директорії
let result = dotenv.config();
if (result.error) {
  // Якщо не вдалося, намагаємося з явним шляхом
  const envPath = path.resolve(__dirname, "../.env");
  result = dotenv.config({ path: envPath });
  if (result.error) {
    // Якщо файл не може бути прочитаний через дозволи, просто продовжуємо
    // Змінні оточення можуть бути встановлені через системне оточення
    const error = result.error as NodeJS.ErrnoException;
    if (error.code === 'EPERM') {
      console.warn(`Warning: Cannot read .env file at ${envPath} due to permissions. Using system environment variables.`);
    } else {
      console.warn(`Warning: Could not load .env file: ${result.error.message}. Using system environment variables.`);
    }
  }
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
if (privateKey?.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");

// Діагностика для відлагодження
if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey } as admin.ServiceAccount)
      });
      console.log("Firebase Admin initialized successfully");
      console.log(`Firebase Project ID: ${projectId}`);
      console.log(`Firebase Client Email: ${clientEmail}`);
      console.log(`Firebase Private Key: ${privateKey ? `${privateKey.substring(0, 20)}...` : 'missing'}`);
    } catch (error) {
      console.error("Firebase Admin initialization failed:", error);
    }
  } else {
    console.warn("Firebase Admin is not configured. Missing environment variables:");
    if (!projectId) console.warn("  - FIREBASE_PROJECT_ID");
    if (!clientEmail) console.warn("  - FIREBASE_CLIENT_EMAIL");
    if (!privateKey) console.warn("  - FIREBASE_PRIVATE_KEY");
    console.warn("Google OAuth login will not work without these variables.");
    console.warn("Current env vars check:", {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE'))
    });
  }
} else {
  console.log("Firebase Admin already initialized");
}

export { admin };

