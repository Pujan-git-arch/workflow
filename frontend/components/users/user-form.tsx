"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useDepartments } from "@/hooks/use-departments";
import type { UserFormValues, UserItem } from "@/types/user";

const userSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().optional(),
  department_id: z.number().int().positive("Department is required"),
});

export type UserFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<UserItem> | null;
  onSubmit: (values: UserFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const defaultValues: UserFormValues = {
  name: "",
  email: "",
  password: "",
  department_id: 1,
};

export function UserForm({ mode, initialValues, onSubmit, onCancel, submitLabel }: UserFormProps) {
  const { data: departments = [] } = useDepartments();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema as any) as any,
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      form.reset(defaultValues);
      return;
    }

    form.reset({
      name: initialValues.name ?? "",
      email: initialValues.email ?? "",
      password: "",
      department_id: initialValues.department_id ?? 1,
    });
  }, [form, initialValues]);

  const handleFormSubmit = (values: UserFormValues) => {
    void onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          {...form.register("name")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          placeholder="John Doe"
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...form.register("email")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          placeholder="john@example.com"
        />
        {form.formState.errors.email ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      {mode === "create" && (
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...form.register("password", {
              required: mode === "create" ? "Password is required" : false,
            })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
            placeholder="••••••••"
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
      )}

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

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{submitLabel ?? (mode === "create" ? "Create user" : "Save changes")}</Button>
      </div>
    </form>
  );
}
