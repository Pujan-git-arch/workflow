import {
  CheckCircle2,
  CircleDot,
  ListTodo,
  TriangleAlert,
} from "lucide-react";

import { StatCard } from "./stat-card";

interface StatsGridProps {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  highPriorityTasks: number;
}

export function StatsGrid({
  totalTasks,
  activeTasks,
  completedTasks,
  highPriorityTasks,
}: StatsGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Tasks"
        value={totalTasks}
        description="All tasks in your workspace"
        icon={ListTodo}
      />

      <StatCard
        title="In Progress"
        value={activeTasks}
        description="Tasks currently being worked on"
        icon={CircleDot}
      />

      <StatCard
        title="Completed"
        value={completedTasks}
        description="Successfully completed tasks"
        icon={CheckCircle2}
      />

      <StatCard
        title="High Priority"
        value={highPriorityTasks}
        description="Tasks that need attention"
        icon={TriangleAlert}
      />
    </section>
  );
}