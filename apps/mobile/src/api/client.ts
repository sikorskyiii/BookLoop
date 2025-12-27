import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

// For iOS simulator, use your Mac's IP address instead of localhost
// For physical device, also use your Mac's IP address
// You can find your IP with: ifconfig | grep "inet " | grep -v 127.0.0.1
const baseURL = Platform.select({
  ios: "http://192.168.0.111:3000", // Use your Mac's IP address for iOS simulator
  android: "http://10.0.2.2:3000", // Android emulator
  default: "http://localhost:3000"
});

console.log("API Base URL:", baseURL);

export const api: AxiosInstance = axios.create({ 
  baseURL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

let authToken: string | null = null;
export function setAuthToken(t: string | null): void {
  authToken = t || null;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else {
    console.warn("No auth token available for request:", config.url);
  }
  return config;
});

