import { create } from "zustand";
import { api } from "../api/client";
import { updateProfileApi, getProfileApi } from "../api/profile";

interface ProfileStats {
  readers: number;
  following: number;
  booksCount: number;
}

interface ProfileState {
  stats: ProfileStats | null;
  loading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    city?: string;
    bio?: string;
    profilePictureUrl?: string;
  }) => Promise<{ ok: boolean; error?: any }>;
}

export const useProfile = create<ProfileState>((set, get) => ({
  stats: null,
  loading: false,
  fetchProfile: async (userId: string) => {
    set({ loading: true });
    try {
      const { stats } = await getProfileApi(userId);
      set({ stats, loading: false });
    } catch (error) {
      console.error("Fetch profile error:", error);
      set({ loading: false });
    }
  },
  updateProfile: async (payload) => {
    set({ loading: true });
    try {
      console.log("useProfile.updateProfile called with:", payload);
      const response = await updateProfileApi(payload);
      console.log("useProfile.updateProfile response:", response);
      
      // Update user in auth store
      const useAuthStore = (await import("./useAuth")).useAuth;
      const currentUser = useAuthStore.getState().user;
      
      if (response.user) {
        useAuthStore.setState({ user: response.user });
        console.log("User updated in auth store");
      } else if (currentUser) {
        // If response doesn't have user, update current user with new values
        useAuthStore.setState({
          user: {
            ...currentUser,
            firstName: payload.firstName ?? currentUser.firstName,
            lastName: payload.lastName ?? currentUser.lastName,
            city: payload.city ?? currentUser.city,
            bio: payload.bio ?? currentUser.bio,
            profilePictureUrl: payload.profilePictureUrl ?? currentUser.profilePictureUrl
          }
        });
      }
      
      set({ loading: false });
      return { ok: true };
    } catch (error: any) {
      console.error("useProfile.updateProfile error:", error);
      const err = error?.response?.data || { message: error?.message || "Помилка оновлення профілю" };
      set({ loading: false });
      return { ok: false, error: err };
    }
  }
}));

