import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Training Institute CRM",
  description:
    "Sign in to the Training Institute CRM.",
};

export default function LoginPage() {
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
          Sign in to access leads, courses,
          batches, and enrollment management.
        </p>

        <LoginForm />

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