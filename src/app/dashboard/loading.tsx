export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-6"
    >
      <span className="sr-only">
        Loading dashboard content
      </span>

      {/* Page heading skeleton */}
      <section
        aria-hidden="true"
        className="animate-pulse rounded-xl bg-white p-5 shadow-sm sm:p-8"
      >
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-4 h-8 w-48 max-w-full rounded bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-200" />
        <div className="mt-2 h-5 w-3/4 max-w-md rounded bg-slate-200" />
      </section>

      {/* Statistics skeleton */}
      <section
        aria-hidden="true"
        className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[1, 2, 3, 4].map((item) => (
          <article
            key={item}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-1 w-12 rounded bg-slate-200" />
            <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
            <div className="mt-3 h-9 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-200" />
          </article>
        ))}
      </section>

      {/* Content skeleton */}
      <section
        aria-hidden="true"
        className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full max-w-md rounded bg-slate-200" />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-2 h-12 w-full rounded-lg bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-6 ml-auto h-12 w-full rounded-lg bg-slate-200 sm:w-32" />
      </section>
    </div>
  );
}