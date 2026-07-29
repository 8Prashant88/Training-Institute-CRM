"use client";

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
    <section className="rounded-xl bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
        Something went wrong
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Dashboard content could not load
      </h1>

      <p className="mt-2 text-slate-600">
        Please try loading this page again.
      </p>

      <p className="mt-4 text-sm text-slate-500">
        {error.message}
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </section>
  );
}