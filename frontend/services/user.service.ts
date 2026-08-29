import api from "@/lib/axios";
import type { UserItem, CreateUserPayload, UpdateUserPayload } from "@/types/user";

export async function getUsers(): Promise<UserItem[]> {
  const response = await api.get<UserItem[]>("/api/users/");
  return response.data;
}

export async function getUser(id: number): Promise<UserItem> {
  const response = await api.get<UserItem>(`/api/users/${id}`);
  return response.data;
}

export async function createUser(payload: CreateUserPayload): Promise<UserItem> {
  const response = await api.post<UserItem>("/api/users/", payload);
  return response.data;
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserItem> {
  const response = await api.put<UserItem>(`/api/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
