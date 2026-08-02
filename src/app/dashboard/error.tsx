"use client";

import { TriangleAlert } from "lucide-react";

import Button from "@/components/ui/Button";

type DashboardErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function DashboardError({
  error,
  reset,
}: DashboardErrorProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-card)]">
      <div
        aria-hidden="true"
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600"
      >
        <TriangleAlert className="size-6" />
      </div>

      <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-red-600">
        Something went wrong
      </p>

      <h1 className="mt-2 text-3xl font-bold text-primary-900">
        Dashboard content could not load
      </h1>

      <p className="mt-2 text-slate-600">
        Please try loading this page again.
      </p>

      <p className="mt-4 text-sm text-slate-500">{error.message}</p>

      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </section>
  );
}
