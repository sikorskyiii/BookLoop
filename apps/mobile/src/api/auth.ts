import { api } from "./client";

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface GoogleLoginPayload {
  idToken: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
}

interface MeResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
}

export async function registerApi(payload: RegisterPayload): Promise<{ user: AuthResponse["user"] }> {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

export async function meApi(): Promise<MeResponse> {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function googleLoginApi({ idToken }: GoogleLoginPayload): Promise<AuthResponse> {
  const { data } = await api.post("/auth/google", { idToken, provider: "firebase" });
  return data;
}

