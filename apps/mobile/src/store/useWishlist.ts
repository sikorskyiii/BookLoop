import { create } from "zustand";
import { api } from "../api/client";

interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  description?: string | null;
  cover?: string | null;
  category?: string | null;
  location?: string | null;
  price?: number | null;
  created_at: string;
}

interface WishlistState {
  items: Book[];
  loading: boolean;
  fetch: () => Promise<void>;
  add: (bookId: string) => Promise<{ ok: boolean; error?: any }>;
  remove: (bookId: string) => Promise<{ ok: boolean; error?: any }>;
  isInWishlist: (bookId: string) => boolean;
}

export const useWishlist = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/books/wishlist");
      set({ items: data.items || [], loading: false });
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      set({ items: [], loading: false });
    }
  },
  add: async (bookId: string) => {
    try {
      await api.post(`/books/wishlist/${bookId}`);
      await get().fetch();
      return { ok: true };
    } catch (error: any) {
      const err = error?.response?.data || { message: "Помилка додавання до вішлисту" };
      return { ok: false, error: err };
    }
  },
  remove: async (bookId: string) => {
    try {
      await api.delete(`/books/wishlist/${bookId}`);
      await get().fetch();
      return { ok: true };
    } catch (error: any) {
      const err = error?.response?.data || { message: "Помилка видалення з вішлисту" };
      return { ok: false, error: err };
    }
  },
  isInWishlist: (bookId: string) => {
    return get().items.some((item) => item.id === bookId);
  }
}));

