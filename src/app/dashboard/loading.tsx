import Skeleton from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div role="status" aria-live="polite" className="grid gap-6">
      <span className="sr-only">Loading dashboard content</span>

      <section
        aria-hidden="true"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8"
      >
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-48 max-w-full" />
        <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      </section>

      <section
        aria-hidden="true"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)]"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-9 w-16" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </section>

      <section aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
          >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-56" />
            <div className="mt-6 grid gap-4">
              {[1, 2, 3].map((row) => (
                <div key={row}>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-2 h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
