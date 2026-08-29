"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowRight,
} from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { TaskForm } from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useTasks } from "@/hooks/use-tasks";
import type { TaskItem, TaskStatus, TaskPriority } from "@/types/task";

export default function DashboardPage() {
  const {
    data: tasks = [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTasks();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] =
    useState<TaskItem | null>(null);

  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) =>
      task.title
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [tasks, search]);

  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const highPriority = tasks.filter(
    (task) => task.priority === "high"
  ).length;

  const completion =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  async function handleCreate(values: any) {
    await createTask(values);
    setFormOpen(false);
  }

  async function handleUpdate(values: any) {
    if (!editingTask) return;

    await updateTask({
      id: editingTask.id,
      payload: values,
    });

    setEditingTask(null);
    setFormOpen(false);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    await deleteTask(id);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">

        <DashboardNav />

        <main className="min-w-0 flex-1">

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

            {/* HEADER */}
            <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Overview
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  Dashboard
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Manage your work and keep track of your team's progress.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingTask(null);
                  setFormOpen(true);
                }}
                className="gap-2 rounded-xl"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>

            </div>

            {/* STATISTICS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="Total Tasks"
                value={total}
                description="All tasks"
                icon={ListTodo}
              />

              <StatCard
                title="In Progress"
                value={inProgress}
                description="Currently active"
                icon={Clock3}
              />

              <StatCard
                title="Completed"
                value={completed}
                description="Finished work"
                icon={CheckCircle2}
              />

              <StatCard
                title="High Priority"
                value={highPriority}
                description="Needs attention"
                icon={AlertTriangle}
              />

            </div>

            {/* CONTENT */}
            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">

              {/* TASKS */}
              <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                <div className="border-b p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Recent Tasks
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Your latest tasks and activity.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <Input
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Search tasks..."
                        className="pl-9"
                      />
                    </div>

                  </div>

                </div>

                {/* LOADING */}
                {isLoading && (
                  <div className="space-y-4 p-6">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-xl bg-slate-100 p-5"
                      >
                        <div className="h-4 w-1/3 rounded bg-slate-200" />
                        <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />
                      </div>
                    ))}
                  </div>
                )}

                {/* ERROR */}
                {!isLoading && error && (
                  <div className="p-10 text-center">
                    <p className="font-semibold text-red-600">
                      Failed to load tasks
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Please check your backend connection.
                    </p>
                  </div>
                )}

                {/* EMPTY */}
                {!isLoading &&
                  !error &&
                  filteredTasks.length === 0 && (
                    <div className="p-12 text-center">
                      <ListTodo className="mx-auto h-10 w-10 text-slate-300" />

                      <h3 className="mt-4 font-semibold">
                        No tasks found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a task or change your search.
                      </p>
                    </div>
                  )}

                {/* TASK LIST */}
                {!isLoading &&
                  !error &&
                  filteredTasks.length > 0 && (
                    <div className="divide-y">

                      {filteredTasks.slice(0, 8).map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onEdit={() => {
                            setEditingTask(task);
                            setFormOpen(true);
                          }}
                          onDelete={() =>
                            handleDelete(task.id)
                          }
                        />
                      ))}

                    </div>
                  )}

              </section>

              {/* PROGRESS */}
              <section className="rounded-2xl border bg-white p-6 shadow-sm">

                <h2 className="font-semibold">
                  Your Progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Overall completion
                </p>

                <div className="mt-8 flex justify-center">

                  <div
                    className="relative flex h-44 w-44 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#0f172a ${completion}%, #e2e8f0 ${completion}% 100%)`,
                    }}
                  >
                    <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-white">

                      <span className="text-4xl font-bold">
                        {completion}%
                      </span>

                      <span className="text-xs text-slate-500">
                        completed
                      </span>

                    </div>
                  </div>

                </div>

                <div className="mt-8 space-y-4">

                  <ProgressRow
                    label="Completed"
                    value={completed}
                  />

                  <ProgressRow
                    label="In Progress"
                    value={inProgress}
                  />

                  <ProgressRow
                    label="Remaining"
                    value={Math.max(
                      total - completed - inProgress,
                      0
                    )}
                  />

                </div>

              </section>

            </div>

          </div>

        </main>

      </div>

      {/* TASK FORM */}
      {formOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingTask
                    ? "Update task information."
                    : "Add a new task to your workspace."}
                </p>
              </div>

              <button
                onClick={() => {
                  setFormOpen(false);
                  setEditingTask(null);
                }}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <TaskForm
              mode={editingTask ? "edit" : "create"}
              initialValues={editingTask ?? undefined}
              onSubmit={
                editingTask
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={() => {
                setFormOpen(false);
                setEditingTask(null);
              }}
              submitLabel={
                editingTask ? "Save changes" : "Create task"
              }
            />

          </div>

        </div>
      )}

    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>

      </div>

    </div>
  );
}

function TaskRow({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center">

      <div
        className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
          task.status === "done"
            ? "bg-emerald-500"
            : task.status === "in_progress"
              ? "bg-blue-500"
              : "bg-slate-300"
        }`}
      />

      <div className="min-w-0 flex-1">

        <p className="truncate font-medium text-slate-900">
          {task.title}
        </p>

        <p className="mt-1 truncate text-sm text-slate-500">
          {task.description || "No description"}
        </p>

      </div>

      <div className="flex items-center gap-2">

        <Badge
          text={
            task.status === "in_progress"
              ? "In Progress"
              : task.status === "done"
                ? "Completed"
                : "Todo"
          }
          type={task.status}
        />

        <Badge
          text={task.priority}
          type={task.priority}
        />

      </div>

      <div className="flex gap-1">

        <button
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <button
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>

      </div>

    </div>
  );
}

function Badge({
  text,
  type,
}: {
  text: string;
  type: string;
}) {
  const styles: Record<string, string> = {
    todo: "bg-slate-100 text-slate-600",
    in_progress: "bg-blue-50 text-blue-700",
    done: "bg-emerald-50 text-emerald-700",
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[type] || styles.todo}`}
    >
      {text}
    </span>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}
