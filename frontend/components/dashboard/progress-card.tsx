import { CheckCircle2 } from "lucide-react";

interface ProgressCardProps {
  completionRate: number;
  completedTasks: number;
  activeTasks: number;
  remainingTasks: number;
}

export function ProgressCard({
  completionRate,
  completedTasks,
  activeTasks,
  remainingTasks,
}: ProgressCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold">
          Your Progress
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Overall task completion
        </p>
      </div>

      {/* Progress circle */}
      <div className="mt-8 flex justify-center">
        <div
          className="relative flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(
              rgb(15 23 42) ${completionRate}%,
              rgb(241 245 249) ${completionRate}% 100%
            )`,
          }}
        >
          <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
            <CheckCircle2 className="mb-1 h-5 w-5 text-slate-700" />

            <p className="text-3xl font-semibold">
              {completionRate}%
            </p>

            <p className="text-xs text-muted-foreground">
              completed
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-8 space-y-4">
        <ProgressRow
          label="Completed"
          value={completedTasks}
        />

        <ProgressRow
          label="In Progress"
          value={activeTasks}
        />

        <ProgressRow
          label="Remaining"
          value={remainingTasks}
        />
      </div>
    </div>
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
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-slate-400" />

        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}