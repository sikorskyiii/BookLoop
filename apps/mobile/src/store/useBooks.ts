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
  fetch: () => Promise<void>;
  add: (title: string, author: string, extra?: Partial<Book>) => Promise<void>;
}

export const useBooks = create<BooksState>((set, get) => ({
  items: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/books");
      set({ items: data.items ?? data });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
  add: async (title: string, author: string, extra = {}) => {
    try {
      const { data } = await api.post("/books", { title, author, ...extra });
      set({ items: [data, ...get().items] });
    } catch {
      throw new Error("Не вдалося додати книгу");
    }
  }
}));

