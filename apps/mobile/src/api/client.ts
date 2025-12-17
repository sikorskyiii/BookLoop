import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

const baseURL = Platform.select({
  ios: "http://localhost:3000",
  android: "http://10.0.2.2:3000",
  default: "http://192.168.0.100:3000"
});

export const api: AxiosInstance = axios.create({ baseURL });

let authToken: string | null = null;
export function setAuthToken(t: string | null): void {
  authToken = t || null;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

