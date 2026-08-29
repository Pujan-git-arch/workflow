"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CheckSquare2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";

const mainLinks = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare2,
  },
];

const workspaceLinks = [
  {
    name: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
  },
  {
    name: "Team",
    href: "/dashboard/users",
    icon: Users,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-5 lg:hidden">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight"
        >
          Work<span className="text-slate-500">Flow</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </header>

      {/* MOBILE NAV */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white p-5 lg:hidden">
          <NavSection
            title="Main"
            links={mainLinks}
            pathname={pathname}
            active={active}
            close={() => setMobileOpen(false)}
          />

          <NavSection
            title="Workspace"
            links={workspaceLinks}
            pathname={pathname}
            active={active}
            close={() => setMobileOpen(false)}
          />

          <div className="mt-8 border-t pt-5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">

          {/* LOGO */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight"
            >
              Work<span className="text-slate-500">Flow</span>
            </Link>
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 px-4 py-7">

            <NavSection
              title="Main"
              links={mainLinks}
              pathname={pathname}
              active={active}
            />

            <NavSection
              title="Workspace"
              links={workspaceLinks}
              pathname={pathname}
              active={active}
            />

            <NavSection
              title="Account"
              links={[
                {
                  name: "Settings",
                  href: "/dashboard/settings",
                  icon: Settings,
                },
              ]}
              pathname={pathname}
              active={active}
            />

          </div>

          {/* USER */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 rounded-xl p-2">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {user?.email || ""}
                </p>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>

            </div>
          </div>

        </div>
      </aside>

      {/* SPACE FOR SIDEBAR */}
      <div className="hidden w-64 shrink-0 lg:block" />
    </>
  );
}

function NavSection({
  title,
  links,
  pathname,
  active,
  close,
}: {
  title: string;
  links: {
    name: string;
    href: string;
    icon: typeof LayoutDashboard;
  }[];
  pathname: string;
  active: (href: string) => boolean;
  close?: () => void;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = active(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-slate-700"
                }`}
              />

              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
