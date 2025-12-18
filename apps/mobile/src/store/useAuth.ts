import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../api/client";
import { loginApi, registerApi, meApi, googleLoginApi } from "../api/auth";

const TOKEN_KEY = "auth_token_v1";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface AuthError {
  message?: string;
  errors?: Record<string, string>;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  isGuest: boolean;
  init: () => Promise<void>;
  register: (payload: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ ok: boolean; error?: AuthError }>;
  login: (credentials: { email: string; password: string }) => Promise<{ ok: boolean; error?: AuthError }>;
  googleLogin: (firebaseIdToken: string) => Promise<{ ok: boolean; error?: AuthError }>;
  skipAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const GUEST_MODE_KEY = "guest_mode_v1";

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  isGuest: false,

  init: async () => {
    try {
      set({ loading: true, error: null });
      const guestMode = await SecureStore.getItemAsync(GUEST_MODE_KEY);
      if (guestMode === "true") {
        set({ isGuest: true, loading: false });
        return;
      }
      const t = await SecureStore.getItemAsync(TOKEN_KEY);
      if (t) {
        setAuthToken(t);
        set({ token: t });
        try {
          const { user } = await meApi();
          set({ user });
        } catch {}
      }
    } finally {
      set({ loading: false });
    }
  },

  register: async ({ firstName, lastName, email, password }) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await registerApi({ firstName, lastName, email, password });
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.deleteItemAsync(GUEST_MODE_KEY); // Clear guest mode if exists
      set({ token, user, loading: false, error: null, isGuest: false });
      return { ok: true };
    } catch (e: any) {
      const err = e?.response?.data || { message: "Помилка реєстрації" };
      set({ error: err, loading: false });
      return { ok: false, error: err };
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await loginApi({ email, password });
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.deleteItemAsync(GUEST_MODE_KEY); // Clear guest mode if exists
      set({ token, user, loading: false, error: null, isGuest: false });
      return { ok: true };
    } catch (e: any) {
      const apiErr = e?.response?.data || {};
      const err = typeof apiErr === "object" ? apiErr : { message: "Невірні дані входу" };
      set({ error: err, loading: false });
      return { ok: false, error: err };
    }
  },
  googleLogin: async (firebaseIdToken: string) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await googleLoginApi({ idToken: firebaseIdToken });
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.deleteItemAsync(GUEST_MODE_KEY); // Clear guest mode if exists
      set({ token, user, loading: false, error: null, isGuest: false });
      return { ok: true };
    } catch (e: any) {
      const err = e?.response?.data || { message: "Помилка входу через Google" };
      set({ error: err, loading: false });
      return { ok: false, error: err };
    }
  },
  skipAuth: async () => {
    await SecureStore.setItemAsync(GUEST_MODE_KEY, "true");
    await SecureStore.deleteItemAsync(TOKEN_KEY); // Clear token if exists
    setAuthToken(null);
    set({ isGuest: true, token: null, user: null, error: null });
  },
  logout: async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(GUEST_MODE_KEY);
    set({ token: null, user: null, error: null, isGuest: false });
  }
}));

