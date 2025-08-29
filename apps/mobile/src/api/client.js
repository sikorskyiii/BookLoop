import axios from "axios";
import { Platform } from "react-native";

const baseURL = Platform.select({
  ios: "http://localhost:3000",     
  android: "http://10.0.2.2:3000",  
  default: "http://192.168.0.100:3000" 
});

export const api = axios.create({ baseURL });

let authToken = null;
export function setAuthToken(t) { authToken = t || null; }
api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});
