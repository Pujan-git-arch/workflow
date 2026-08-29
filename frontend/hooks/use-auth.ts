"use client";

import { useRouter } from "next/navigation";

import api from "@/lib/axios";
import { getCurrentUser, loginUser, registerUser } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginCredentials, RegisterPayload } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const login = async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials);

    api.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;
    window.localStorage.setItem(
      "workflow-auth-store",
      JSON.stringify({
        state: {
          token: response.access_token,
          user: null,
          isAuthenticated: true,
        },
      })
    );

    const profile = await getCurrentUser();
    setAuth(response.access_token, profile);
    return profile;
  };

  const signUp = async (payload: RegisterPayload) => {
    await registerUser(payload);
    return true;
  };

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  const refreshUser = async () => {
    if (!token) {
      return null;
    }

    const profile = await getCurrentUser();
    setUser(profile);
    return profile;
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    signUp,
    logout,
    refreshUser,
  };
}
