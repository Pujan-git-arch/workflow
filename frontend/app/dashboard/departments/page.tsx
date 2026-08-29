"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { DepartmentForm } from "@/components/departments/department-form";
import { useDepartments } from "@/hooks/use-departments";
import type { DepartmentFormValues, DepartmentItem } from "@/types/department";

export default function DepartmentsPage() {
  const { data: departments = [], isLoading, error, createDepartment, updateDepartment, deleteDepartment } =
    useDepartments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);

  const handleCreate = async (values: DepartmentFormValues) => {
    await createDepartment(values);
    setIsFormOpen(false);
  };

  const handleEdit = async (values: DepartmentFormValues) => {
    if (!editingDepartment) return;
    await updateDepartment({ id: editingDepartment.id, payload: values });
    setEditingDepartment(null);
  };

  const handleDelete = async (deptId: number) => {
    await deleteDepartment(deptId);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <DashboardNav />
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Management</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Departments</h1>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingDepartment(null);
                  setIsFormOpen(true);
                }}
              >
                New department
              </Button>
            </div>
          </div>

        {isFormOpen ? (
          <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
            <DepartmentForm
              mode={editingDepartment ? "edit" : "create"}
              initialValues={editingDepartment}
              onSubmit={editingDepartment ? handleEdit : handleCreate}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingDepartment(null);
              }}
              submitLabel={editingDepartment ? "Update department" : "Create department"}
            />
          </div>
        ) : null}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {isLoading ? (
            <p className="text-slate-500">Loading departments...</p>
          ) : error ? (
            <p className="text-red-600">Failed to load departments.</p>
          ) : departments.length === 0 ? (
            <p className="text-slate-500">No departments available yet.</p>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                      <p className="text-sm text-slate-500">ID: {dept.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDepartment(dept);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(dept.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </main>
  );
}
