import axios from "axios";
export const api = axios.create({ baseURL: "http://localhost:3000" });
let authToken = null;
export function setAuthToken(t) {
  authToken = t || null;
}
api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});
