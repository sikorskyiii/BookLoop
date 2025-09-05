import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const extra =
  (Constants?.expoConfig?.extra) ??
  Constants?.manifestExtra ??
  (Constants?.manifest?.extra) ??
  {};

const firebaseConfig = extra?.firebase || {};

if (!firebaseConfig?.apiKey || !firebaseConfig?.projectId || !firebaseConfig?.appId) {
  throw new Error("[Firebase] Missing config in app.config.js -> extra.firebase");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
