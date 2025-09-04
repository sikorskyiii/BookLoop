import { api } from "./client";

export async function registerApi(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginApi(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function meApi() {
  const { data } = await api.get("/auth/me");
  return data; 
}

export async function googleLoginApi({ idToken }) {
  const { data } = await api.post("/auth/google", { idToken, provider: "firebase" });
  return data; 
}