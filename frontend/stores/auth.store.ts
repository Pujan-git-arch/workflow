import { create } from "zustand";
import { persist } from "zustand/middleware";

import api from "@/lib/axios";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        set({
          token,
          user,
          isAuthenticated: true,
        });
      },
      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),
      clearAuth: () => {
        delete api.defaults.headers.common.Authorization;
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "workflow-auth-store",
    }
  )
);
