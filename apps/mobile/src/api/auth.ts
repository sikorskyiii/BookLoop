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

export async function registerApi(payload: RegisterPayload): Promise<AuthResponse> {
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
  try {
    console.log("Sending Google login request to API...");
    console.log("API endpoint:", api.defaults.baseURL + "/auth/google");
    console.log("idToken length:", idToken?.length || 0);
    const { data } = await api.post("/auth/google", { idToken }, {
      timeout: 60000, // 60 seconds timeout
    });
    console.log("Google login API response received");
    return data;
  } catch (error: any) {
    console.log("Google login API error:", error);
    console.log("Error code:", error?.code);
    console.log("Error message:", error?.message);
    console.log("Error response:", error?.response?.data);
    console.log("Error status:", error?.response?.status);
    
    // Handle timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('exceeded')) {
      const err = new Error("Час очікування вичерпано. Перевірте підключення до сервера.");
      (err as any).response = { data: { message: "Час очікування вичерпано" } };
      throw err;
    }
    
    // Handle connection errors
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT') {
      const err = new Error("Не вдалося підключитися до сервера. Перевірте, чи запущений API сервер.");
      (err as any).response = { data: { message: "Не вдалося підключитися до сервера" } };
      throw err;
    }
    
    // Re-throw with response data if available
    if (error?.response?.data) {
      throw error;
    }
    
    // Create error with response structure
    const err = new Error(error?.message || "Помилка входу через Google");
    (err as any).response = { data: { message: error?.message || "Помилка входу через Google" } };
    throw err;
  }
}

