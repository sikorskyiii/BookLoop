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

interface BooksState {
  items: Book[];
  loading: boolean;
  fetch: (userId?: string) => Promise<void>;
  add: (title: string, author: string, extra?: Partial<Book>) => Promise<void>;
}

export const useBooks = create<BooksState>((set, get) => ({
  items: [],
  loading: false,
  fetch: async (userId?: string) => {
    set({ loading: true });
    try {
      const url = userId ? `/books?userId=${userId}` : "/books";
      const { data } = await api.get(url);
      set({ items: data.items ?? data });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
  add: async (title: string, author: string, extra = {}) => {
    set({ loading: true });
    try {
      const payload = {
        title,
        author,
        ...extra,
        price: extra.price !== null && extra.price !== undefined ? Number(extra.price) : null,
        location: extra.location || null
      };
      console.log("Adding book with payload:", payload);
      const { data } = await api.post("/books", payload);
      console.log("Book added successfully:", data);
      set({ items: [data, ...get().items], loading: false });
    } catch (error: any) {
      console.error("Add book error:", error);
      console.error("Error response:", error?.response?.data);
      set({ loading: false });
      throw new Error(error?.response?.data?.message || error?.message || "Не вдалося додати книгу");
    }
  }
}));

