"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UserForm } from "@/components/users/user-form";
import { useUsers } from "@/hooks/use-users";
import { useDepartments } from "@/hooks/use-departments";
import type { UserFormValues, UserItem } from "@/types/user";

export default function UsersPage() {
  const { data: users = [], isLoading, error, createUser, updateUser, deleteUser } = useUsers();
  const { data: departments = [] } = useDepartments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const getDepartmentName = (deptId: number) => {
    return departments.find((d) => d.id === deptId)?.name || `Department ${deptId}`;
  };

  const handleCreate = async (values: UserFormValues) => {
    if (!values.password) throw new Error("Password is required");
    await createUser({
      name: values.name,
      email: values.email,
      password: values.password,
      department_id: values.department_id,
    });
    setIsFormOpen(false);
  };

  const handleEdit = async (values: UserFormValues) => {
    if (!editingUser) return;
    await updateUser({
      id: editingUser.id,
      payload: {
        name: values.name !== editingUser.name ? values.name : undefined,
        email: values.email !== editingUser.email ? values.email : undefined,
        department_id: values.department_id !== editingUser.department_id ? values.department_id : undefined,
      },
    });
    setEditingUser(null);
  };

  const handleDelete = async (userId: number) => {
    await deleteUser(userId);
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
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Users</h1>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingUser(null);
                  setIsFormOpen(true);
                }}
              >
                New user
              </Button>
            </div>
          </div>

        {isFormOpen ? (
          <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
            <UserForm
              mode={editingUser ? "edit" : "create"}
              initialValues={editingUser}
              onSubmit={editingUser ? handleEdit : handleCreate}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingUser(null);
              }}
              submitLabel={editingUser ? "Update user" : "Create user"}
            />
          </div>
        ) : null}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {isLoading ? (
            <p className="text-slate-500">Loading users...</p>
          ) : error ? (
            <p className="text-red-600">Failed to load users.</p>
          ) : users.length === 0 ? (
            <p className="text-slate-500">No users available yet.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">{getDepartmentName(user.department_id)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
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
