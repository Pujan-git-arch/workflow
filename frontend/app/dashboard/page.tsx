"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { TaskForm } from "@/components/tasks/task-form";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskFormValues, TaskItem } from "@/types/task";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, error, createTask, updateTask, deleteTask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const handleCreate = async (values: TaskFormValues) => {
    const payload = {
      ...values,
      description: values.description || null,
      due_date: values.due_date || null,
      assigned_to: values.assigned_to === "" ? null : Number(values.assigned_to),
    };

    await createTask(payload);
    setIsFormOpen(false);
  };

  const handleEdit = async (values: TaskFormValues) => {
    if (!editingTask) return;

    const payload = {
      ...values,
      description: values.description || null,
      due_date: values.due_date || null,
      assigned_to: values.assigned_to === "" ? null : Number(values.assigned_to),
    };

    await updateTask({ id: editingTask.id, payload });
    setEditingTask(null);
  };

  const handleDelete = async (taskId: number) => {
    await deleteTask(taskId);
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <DashboardNav />
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Overview</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
            </div>
          </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total tasks</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{tasks.length}</p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Open</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tasks.filter((task) => task.status !== "done").length}
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">High priority</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tasks.filter((task) => task.priority === "high").length}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Recent tasks</h2>
            <Button size="sm" onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}>
              New task
            </Button>
          </div>

          {isFormOpen ? (
            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <TaskForm
                mode={editingTask ? "edit" : "create"}
                initialValues={editingTask}
                onSubmit={editingTask ? handleEdit : handleCreate}
                onCancel={() => {
                  setIsFormOpen(false);
                  setEditingTask(null);
                }}
                submitLabel={editingTask ? "Update task" : "Create task"}
              />
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-slate-500">Loading tasks...</p>
          ) : error ? (
            <p className="text-red-600">Failed to load tasks.</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-500">No tasks available yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{task.title}</h3>
                      <p className="text-sm text-slate-500">{task.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {task.priority}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTask(task);
                          setIsFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                      >
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
