import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const expoExtra =
  (Constants?.expoConfig && Constants.expoConfig.extra) ||
  Constants?.manifestExtra ||
  (Constants?.manifest && Constants.manifest.extra) ||
  {};

const firebaseConfig = expoExtra.firebase || {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
};

if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId || !firebaseConfig?.appId) {
  throw new Error(
    "[Firebase] Missing config at runtime. " +
      "Перевір, що app.json -> expo.extra.firebase має apiKey/projectId/appId " +
      "АБО налаштовані EXPO_PUBLIC_FIREBASE_* змінні. " +
      "Після змін перезапусти: npx expo start --clear"
  );
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
