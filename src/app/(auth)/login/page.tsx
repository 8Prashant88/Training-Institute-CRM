"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-900 text-sm font-bold text-white"
          >
            TI
          </span>
          <div>
            <p className="text-sm font-bold leading-tight text-primary-900">
              Training Institute
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600">
              CRM Platform
            </p>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-primary-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in to access leads, courses, and batch management.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <Field id="login-email" label="Email address" required>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="counselor@traininginstitute.example"
            />
          </Field>

          <Field id="login-password" label="Password" required>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 rounded-lg bg-slate-50 p-3 text-center text-xs leading-5 text-slate-500">
          Demo mode — this prototype has no backend authentication yet.
          Any credentials will sign you in.
        </p>

        <Link
          href="/"
          className="mt-5 block text-center text-sm font-medium text-primary-800 transition hover:text-primary-900"
        >
          ← Back to home
        </Link>
      </section>
    </main>
  );
}
