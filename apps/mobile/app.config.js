
module.exports = ({ config }) => ({
  ...config,
  name: "BookLoop",
  slug: "bookloop",
  owner: "sikorskyii",
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
  plugins: ["expo-secure-store", "@react-native-async-storage/async-storage"],
  extra: {
    FIREBASE_API_KEY: "AIzaSyCtWbTEZqMUKo09N_5n1BPRMHKZCKrEW74",
    FIREBASE_AUTH_DOMAIN: "bookloop-af1c8.firebaseapp.com",
    FIREBASE_PROJECT_ID: "bookloop-af1c8",
    FIREBASE_APP_ID: "1:921038747639:web:68c35241ad523cec38a0f2",
    firebase: {
      apiKey: "AIzaSyCtWbTEZqMUKo09N_5n1BPRMHKZCKrEW74",
      authDomain: "bookloop-af1c8.firebaseapp.com",
      projectId: "bookloop-af1c8",
      appId: "1:921038747639:web:68c35241ad523cec38a0f2",
      messagingSenderId: "921038747639",
      storageBucket: "bookloop-af1c8.appspot.com",
      iosClientId: "921038747639-9a2kfr9t9ros4027iamrnmlcfnbiu5f2.apps.googleusercontent.com",
      googleWebClientId: "921038747639-to60mcmk6vgj8m1k171fojb8fq1ebb0r.apps.googleusercontent.com"
      // androidClientId: "…android….apps.googleusercontent.com" // додаси за потреби
    }
  }
});
