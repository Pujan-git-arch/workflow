import api from "@/lib/axios";

import type { CreateTaskPayload, TaskItem, UpdateTaskPayload } from "@/types/task";

export async function getTasks(): Promise<TaskItem[]> {
  const response = await api.get<TaskItem[]>("/api/tasks/");
  return response.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskItem> {
  const response = await api.post<TaskItem>("/api/tasks/", payload);
  return response.data;
}

export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<TaskItem> {
  const response = await api.put<TaskItem>(`/api/tasks/${taskId}`, payload);
  return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/api/tasks/${taskId}`);
}
