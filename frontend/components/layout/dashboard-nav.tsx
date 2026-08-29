"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function DashboardNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-bold text-lg text-slate-900">
              WorkFlow
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
              <Link href="/dashboard/departments" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Departments
              </Link>
              <Link href="/dashboard/users" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Users
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="font-medium text-slate-900">{user?.name ?? "User"}</p>
            </div>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
