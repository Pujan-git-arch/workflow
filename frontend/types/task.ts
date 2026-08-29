export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_by: number;
  assigned_to: number | null;
  department_id: number;
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  department_id: number;
  assigned_to?: number | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
  department_id: number;
  assigned_to: number | null | "";
};
