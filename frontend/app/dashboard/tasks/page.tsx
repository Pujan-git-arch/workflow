"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ListFilter,
} from "lucide-react";

import { DashboardNav } from "@/components/layout/dashboard-nav";
import { TaskForm } from "@/components/tasks/task-form";
import { useTasks } from "@/hooks/use-tasks";
import type {
  TaskItem,
  TaskStatus,
  TaskPriority,
} from "@/types/task";

export default function TasksPage() {
  const {
    data: tasks = [],
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
  } = useTasks();

  const [search, setSearch] = useState("");

  const [status, setStatus] =
    useState<"all" | TaskStatus>("all");

  const [priority, setPriority] =
    useState<"all" | TaskPriority>("all");

  const [formOpen, setFormOpen] = useState(false);

  const [editingTask, setEditingTask] =
    useState<TaskItem | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {

      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (task.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        task.status === status;

      const matchesPriority =
        priority === "all" ||
        task.priority === priority;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [tasks, search, status, priority]);

  async function submit(values: any) {
    if (editingTask) {
      await updateTask({
        id: editingTask.id,
        payload: values,
      });
    } else {
      await createTask(values);
    }

    setFormOpen(false);
    setEditingTask(null);
  }

  async function remove(id: number) {
    if (
      window.confirm(
        "Are you sure you want to delete this task?"
      )
    ) {
      await deleteTask(id);
    }
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
                <h1 className="text-3xl font-bold tracking-tight">
                  Tasks
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Create, manage and track your work.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setFormOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New Task
              </button>

            </div>

            {/* FILTER BAR */}
            <div className="rounded-2xl border bg-white p-4 shadow-sm">

              <div className="flex flex-col gap-4 lg:flex-row">

                {/* SEARCH */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search tasks..."
                    className="w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* STATUS */}
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(
                      e.target.value as
                        | "all"
                        | TaskStatus
                    )
                  }
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="todo">
                    Todo
                  </option>
                  <option value="in_progress">
                    In Progress
                  </option>
                  <option value="done">
                    Completed
                  </option>
                </select>

                {/* PRIORITY */}
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(
                      e.target.value as
                        | "all"
                        | TaskPriority
                    )
                  }
                  className="rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
                >
                  <option value="all">
                    All Priority
                  </option>
                  <option value="low">
                    Low
                  </option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="high">
                    High
                  </option>
                </select>

              </div>

            </div>

            {/* TASK TABLE */}
            <div className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">

              <div className="hidden grid-cols-[1fr_140px_120px_100px] gap-4 border-b bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">

                <span>Task</span>
                <span>Status</span>
                <span>Priority</span>
                <span className="text-right">
                  Actions
                </span>

              </div>

              {isLoading && (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading tasks...
                </div>
              )}

              {error && (
                <div className="p-8 text-center text-sm text-red-600">
                  Failed to load tasks.
                </div>
              )}

              {!isLoading &&
                !error &&
                filteredTasks.length === 0 && (
                  <div className="p-12 text-center">

                    <ListFilter className="mx-auto h-10 w-10 text-slate-300" />

                    <h3 className="mt-4 font-semibold">
                      No matching tasks
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filters.
                    </p>

                  </div>
                )}

              {!isLoading &&
                !error &&
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid gap-4 border-b px-6 py-5 transition hover:bg-slate-50 md:grid-cols-[1fr_140px_120px_100px] md:items-center"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-medium">
                        {task.title}
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {task.description ||
                          "No description"}
                      </p>

                    </div>

                    <Badge type={task.status}>
                      {task.status ===
                      "in_progress"
                        ? "In Progress"
                        : task.status ===
                            "done"
                          ? "Completed"
                          : "Todo"}
                    </Badge>

                    <Badge type={task.priority}>
                      {task.priority}
                    </Badge>

                    <div className="flex justify-start gap-1 md:justify-end">

                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setFormOpen(true);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() =>
                          remove(task.id)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>
                ))}

            </div>

          </div>

        </main>

      </div>

      {/* FORM MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  {editingTask
                    ? "Edit Task"
                    : "Create Task"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the task information below.
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
              onSubmit={submit}
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

function Badge({
  children,
  type,
}: {
  children: React.ReactNode;
  type: string;
}) {
  const styles: Record<string, string> = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-50 text-blue-700",
    done: "bg-emerald-50 text-emerald-700",
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={
        `inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${styles[type] || styles.todo}`
      }
    >
      {children}
    </span>
  );
}
