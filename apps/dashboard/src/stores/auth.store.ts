import { create } from "zustand";

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: "USER" | "ORGANIZER" | "ADMIN";
  status: "UNVERIFIED" | "ACTIVE" | "BANNED";
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isOrganizer: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, accessToken: null }),
  isAuthenticated: () => !!get().accessToken,
  isOrganizer: () => get().user?.role === "ORGANIZER",
  isAdmin: () => get().user?.role === "ADMIN",
}));
