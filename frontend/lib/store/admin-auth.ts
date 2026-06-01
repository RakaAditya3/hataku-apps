import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminUser } from "@/types/api";

type AdminAuthStore = {
  token: string | null;
  admin: AdminUser | null;
  setAuth: (token: string, admin: AdminUser) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
};

export const useAdminAuth = create<AdminAuthStore>()(
  persist(
    (set) => ({
      token: null,
      admin: null,
      isAuthenticated: false,
      setAuth: (token, admin) => set({ token, admin, isAuthenticated: true }),
      clearAuth: () => set({ token: null, admin: null, isAuthenticated: false }),
    }),
    {
      name: "hataku-admin-auth",
    }
  )
);
