import { create } from "zustand";
import { api } from "../api/client";

const FALLBACK = [
  { id: "demo-1", title: "The Prototype", author: "UI/UX", category: "Tech", description: "Demo item when API недоступний", cover: "" },
  { id: "demo-2", title: "Design Systems", author: "Patterns", category: "Non-Fiction", description: "", cover: "" }
];

export const useBooks = create((set, get) => ({
  items: [],
  loading: false,
  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get("/books");
      set({ items: data });
    } catch {
      set({ items: FALLBACK });
    } finally {
      set({ loading: false });
    }
  },
  add: async (title, author, extra = {}) => {
    try {
      const { data } = await api.post("/books", { title, author, ...extra });
      set({ items: [data, ...get().items] });
    } catch {
      const local = { id: "local-"+Date.now(), title, author, ...extra };
      set({ items: [local, ...get().items] });
    }
  }
}));
