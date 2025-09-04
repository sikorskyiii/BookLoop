import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCtWbTEZqMUKo09N_5n1BPRMHKZCKrEW74",
  authDomain: "bookloop-af1c8.firebaseapp.com",
  projectId: "bookloop-af1c8",
  storageBucket: "bookloop-af1c8.firebasestorage.app",
  messagingSenderId: "921038747639",
  appId: "1:921038747639:web:68c35241ad523cec38a0f2",
  measurementId: "G-3HE42XHYFJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);