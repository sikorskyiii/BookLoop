import { create } from "zustand";
import { api } from "../api/client";


 export const useBooks = create((set, get) => ({
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
   add: async (title, author, extra = {}) => {
     try {
       const { data } = await api.post("/books", { title, author, ...extra });
     set({ items: [data, ...get().items] });
     } catch {
        throw new Error("Не вдалося додати книгу");
     }
   }
 }));
