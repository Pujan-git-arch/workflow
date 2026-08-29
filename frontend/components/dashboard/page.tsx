"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { useTasks } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";


import { StatsGrid } from "./stats-grid";
import { RecentTasks } from "./recent-tasks";
import { ProgressCard } from "./progress-card";


export default function DashboardPage() {
  const { user } = useAuth();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useTasks();

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const activeTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high"
  ).length;

  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        );

  return (
    <div className="min-h-screen bg-slate-50">

      <DashboardNav />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mb-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overview
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                Good morning,{" "}
                {user?.name?.split(" ")[0] || "there"} 👋
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Here's what's happening with your work today.
              </p>
            </div>

            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>

          </div>

        </section>

        {/* Statistics */}
        <StatsGrid
          totalTasks={tasks.length}
          activeTasks={activeTasks}
          completedTasks={completedTasks}
          highPriorityTasks={highPriorityTasks}
        />

        {/* Main dashboard content */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

          <RecentTasks
            tasks={tasks}
            isLoading={isLoading}
            error={error}
          />

          <ProgressCard
            completionRate={completionRate}
            completedTasks={completedTasks}
            activeTasks={activeTasks}
            remainingTasks={
              tasks.length -
              completedTasks -
              activeTasks
            }
          />

        </section>

      </main>

    </div>
  );
}
