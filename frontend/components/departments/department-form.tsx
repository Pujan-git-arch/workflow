"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import type { DepartmentFormValues, DepartmentItem } from "@/types/department";

const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required"),
});

export type DepartmentFormProps = {
  mode: "create" | "edit";
  initialValues?: Partial<DepartmentItem> | null;
  onSubmit: (values: DepartmentFormValues) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

const defaultValues: DepartmentFormValues = {
  name: "",
};

export function DepartmentForm({ mode, initialValues, onSubmit, onCancel, submitLabel }: DepartmentFormProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema as any) as any,
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      form.reset(defaultValues);
      return;
    }

    form.reset({
      name: initialValues.name ?? "",
    });
  }, [form, initialValues]);

  const handleFormSubmit = (values: DepartmentFormValues) => {
    void onSubmit(values);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit as any)} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
          Department name
        </label>
        <input
          id="name"
          {...form.register("name")}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
          placeholder="Engineering"
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit">{submitLabel ?? (mode === "create" ? "Create department" : "Save changes")}</Button>
      </div>
    </form>
  );
}
