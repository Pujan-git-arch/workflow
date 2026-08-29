import { ListTodo } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TaskItem } from "@/types/task";

interface RecentTasksProps {
  tasks: TaskItem[];
  isLoading: boolean;
  error: Error | string | null | undefined;
}

export function RecentTasks({
  tasks,
  isLoading,
  error,
}: RecentTasksProps) {
  const hasError = Boolean(error);

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div>
          <h2 className="font-semibold">
            Recent Tasks
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your latest work activity.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
        >
          View All
        </Button>
      </div>

      {/* Content */}
      <div className="divide-y">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse space-y-2"
              >
                <div className="h-4 w-1/2 rounded bg-slate-200" />

                <div className="h-3 w-3/4 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && hasError && (
          <div className="p-10 text-center">
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              We couldn't load your tasks.
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading &&
          !hasError &&
          tasks.length === 0 && (
            <div className="px-6 py-14 text-center">
              <ListTodo className="mx-auto h-10 w-10 text-muted-foreground/40" />

              <h3 className="mt-4 font-medium">
                No tasks yet
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first task to get started.
              </p>

              <Button className="mt-5">
                Create Task
              </Button>
            </div>
          )}

        {/* Tasks */}
        {!isLoading &&
          !hasError &&
          tasks
            .slice(0, 6)
            .map((task) => (
              <TaskRow
                key={task.id}
                task={task}
              />
            ))}
      </div>
    </div>
  );
}

function TaskRow({
  task,
}: {
  task: TaskItem;
}) {
  return (
    <div className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
      {/* Status dot */}
      <div
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
          task.status === "done"
            ? "bg-emerald-500"
            : task.status === "in_progress"
              ? "bg-blue-500"
              : "bg-slate-300"
        }`}
      />

      {/* Task information */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {task.title}
        </p>

        <p className="mt-1 truncate text-xs text-muted-foreground">
          {task.description || "No description"}
        </p>
      </div>

      {/* Status */}
      <StatusBadge status={task.status} />

      {/* Priority */}
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: TaskItem["status"];
}) {
  const styles = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-50 text-blue-700",
    done: "bg-emerald-50 text-emerald-700",
  };

  const labels = {
    todo: "Todo",
    in_progress: "In Progress",
    done: "Completed",
  };

  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: TaskItem["priority"];
}) {
  const styles = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`hidden rounded-full px-2.5 py-1 text-xs font-medium md:inline-flex ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}