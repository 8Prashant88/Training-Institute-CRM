import type { Metadata } from "next";
import Link from "next/link";

import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Training Institute CRM",
  description:
    "Sign in to the Training Institute CRM.",
};

const oauthErrorMessages: Record<string, string> = {
  missing_code: "The Google sign-in link was invalid. Please try again.",
  oauth_failed: "Google sign-in failed. Please try again.",
  not_authorized:
    "This Google account is not authorized to access the CRM. Ask an administrator to add you first.",
  link_failed: "Unable to complete Google sign-in right now. Please try again.",
};

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const oauthError = error ? oauthErrorMessages[error] : undefined;

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

            <p className="text-xs font-semibold uppercase tracking-widest text-accent-700">
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

        <LoginForm initialError={oauthError} />

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