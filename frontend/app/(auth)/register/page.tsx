"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: 1,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Attempting to register with:", form);
      await signUp(form);
      console.log("Registration successful, redirecting to login...");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      console.error("Registration error:", err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">WorkFlow</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="department_id" className="mb-1 block text-sm font-medium text-slate-700">
              Department ID
            </label>
            <input
              id="department_id"
              type="number"
              min={1}
              value={form.department_id}
              onChange={(event) => setForm({ ...form, department_id: Number(event.target.value) || 1 })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-500"
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-slate-900 underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
