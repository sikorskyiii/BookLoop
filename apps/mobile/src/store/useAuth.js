import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../api/client";
import { loginApi, registerApi, meApi } from "../api/auth";
import { googleLoginApi } from "../api/auth";

const TOKEN_KEY = "auth_token_v1";

export const useAuth = create((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null, 

  init: async () => {
    try {
      set({ loading: true, error: null });
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
       await registerApi({ firstName, lastName, email, password });
       set({ loading: false, error: null });
       return { ok: true };
    } catch (e) {
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
      set({ token, user, loading: false, error: null });
      return { ok: true };
    } catch (e) {
      const apiErr = e?.response?.data || {};
      const err = typeof apiErr === "object" ? apiErr : { message: "Невірні дані входу" };
      set({ error: err, loading: false });
      return { ok: false, error: err };
    }
  },
 googleLogin: async (idToken) => {
    set({ loading: true, error: null });
   try {
     const { token, user } = await googleLoginApi(idToken);
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      set({ token, user, loading: false, error: null });
      return { ok: true };
   } catch (e) {
    const apiErr = e?.response?.data || {};
    const err =
       typeof apiErr === "object" ? apiErr : { message: "Не вдалося увійти через Google" };
      set({ error: err, loading: false });
      return { ok: false, error: err };
  }
 },
  logout: async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null, error: null });
  }
}));
