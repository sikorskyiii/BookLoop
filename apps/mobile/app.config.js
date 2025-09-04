require('dotenv').config();

module.exports = ({ config }) => ({
  ...config,
  name: "BookLoop",
  slug: "bookloop",
  scheme: "bookloop",
  runtimeVersion: { policy: "sdkVersion" },
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: { image: "./assets/splash.png", resizeMode: "contain", backgroundColor: "#0f1115" },
  ios: { supportsTablet: true, bundleIdentifier: "com.sikorskyiii.bookloop" },
  android: {
    adaptiveIcon: { foregroundImage: "./assets/icon.png", backgroundColor: "#0f1115" },
    package: "com.sikorskyiii.bookloop"
  },
  web: { bundler: "metro", output: "single" },
  plugins: ["expo-secure-store"],
  extra: {
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
  }
});
