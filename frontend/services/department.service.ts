import api from "@/lib/axios";
import type { DepartmentItem, CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/department";

export async function getDepartments(): Promise<DepartmentItem[]> {
  const response = await api.get<DepartmentItem[]>("/api/departments/");
  return response.data;
}

export async function getDepartment(id: number): Promise<DepartmentItem> {
  const response = await api.get<DepartmentItem>(`/api/departments/${id}`);
  return response.data;
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<DepartmentItem> {
  const response = await api.post<DepartmentItem>("/api/departments/", payload);
  return response.data;
}

export async function updateDepartment(id: number, payload: UpdateDepartmentPayload): Promise<DepartmentItem> {
  const response = await api.put<DepartmentItem>(`/api/departments/${id}`, payload);
  return response.data;
}

export async function deleteDepartment(id: number): Promise<void> {
  await api.delete(`/api/departments/${id}`);
}
