"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/use-departments";
import { useUsers } from "@/hooks/use-users";
import type { TaskFormValues, TaskItem, TaskPriority } from "@/types/task";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().default(""),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.string().optional().default(""),
  department_id: z.number().int().positive("Department is required"),
  assigned_to: z.union([z.number().int().positive(), z.literal(""), z.null()]).optional().default(""),
});

export type TaskFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<TaskItem> | null;
  onSubmit: (values: TaskFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const defaultValues: TaskFormValues = {
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  department_id: 1,
  assigned_to: "",
};

export function TaskForm({ mode, initialValues, onSubmit, onCancel, submitLabel }: TaskFormProps) {
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema as any) as any,
    defaultValues: {
      ...defaultValues,
      ...(initialValues && {
        title: initialValues.title ?? "",
        description: initialValues.description ?? "",
        priority: (initialValues.priority ?? "medium") as TaskPriority,
        due_date: initialValues.due_date ? initialValues.due_date.slice(0, 10) : "",
        department_id: initialValues.department_id ?? 1,
        assigned_to: initialValues.assigned_to ?? "",
      }),
    },
  });

  useEffect(() => {
    if (!initialValues) {
      form.reset(defaultValues);
      return;
    }

    form.reset({
      title: initialValues.title ?? "",
      description: initialValues.description ?? "",
      priority: (initialValues.priority ?? "medium") as TaskPriority,
      due_date: initialValues.due_date ? initialValues.due_date.slice(0, 10) : "",
      department_id: initialValues.department_id ?? 1,
      assigned_to: initialValues.assigned_to ?? "",
    });
  }, [form, initialValues]);

  const handleFormSubmit = (values: TaskFormValues) => {
    void onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          {...form.register("title")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          placeholder="Finish landing page"
        />
        {form.formState.errors.title ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...form.register("description")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          placeholder="Add the final QA notes for the release"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-700">
            Priority
          </label>
          <select
            id="priority"
            {...form.register("priority")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="department_id" className="mb-1 block text-sm font-medium text-slate-700">
            Department
          </label>
          <select
            id="department_id"
            {...form.register("department_id", { valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {form.formState.errors.department_id ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.department_id.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="due_date" className="mb-1 block text-sm font-medium text-slate-700">
            Due date
          </label>
          <input
            id="due_date"
            type="date"
            {...form.register("due_date")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label htmlFor="assigned_to" className="mb-1 block text-sm font-medium text-slate-700">
            Assigned to
          </label>
          <select
            id="assigned_to"
            {...form.register("assigned_to", {
              setValueAs: (value) => (value === "" ? "" : Number(value)),
            })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{submitLabel ?? (mode === "create" ? "Create task" : "Save changes")}</Button>
      </div>
    </form>
  );
}
