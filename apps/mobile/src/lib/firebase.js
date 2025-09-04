import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

const firebaseConfig = Constants?.expoConfig?.extra?.firebase || {};


if (!firebaseConfig.apiKey) {
  throw new Error(
    "[Firebase] Missing config. Put your real firebase config into app.json -> expo.extra.firebase"
  );
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
