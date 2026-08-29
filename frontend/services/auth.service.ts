import api from "@/lib/axios";

import type { AuthUser, LoginCredentials, LoginResponse, RegisterPayload } from "@/types/auth";

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await api.post<LoginResponse>("/api/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post<AuthUser>("/api/users/", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<AuthUser>("/api/auth/me");
  return response.data;
}
