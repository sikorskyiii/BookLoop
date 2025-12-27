import { api } from "./client";

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  city?: string;
  bio?: string;
  profilePictureUrl?: string;
}

interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  createdAt: string;
}

interface ProfileResponse {
  user: UserResponse;
  stats?: {
    readers: number;
    following: number;
    booksCount: number;
  };
}

interface UpdateProfileResponse {
  user: UserResponse;
}

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  try {
    console.log("updateProfileApi called with:", payload);
    console.log("API base URL:", api.defaults.baseURL);
    console.log("Request URL:", `${api.defaults.baseURL}/auth/me`);
    console.log("Auth token present:", !!api.defaults.headers.common['Authorization']);
    
    const { data } = await api.patch("/auth/me", payload);
    console.log("updateProfileApi response:", data);
    // API returns { user: {...} }
    return data;
  } catch (error: any) {
    console.error("updateProfileApi error:", error);
    console.error("Error status:", error?.response?.status);
    console.error("Error response:", error?.response?.data);
    console.error("Error headers:", error?.response?.headers);
    throw error;
  }
}

export async function getProfileApi(userId: string): Promise<ProfileResponse> {
  const { data } = await api.get(`/auth/profile/${userId}`);
  return data;
}

