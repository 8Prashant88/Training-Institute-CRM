export default function DashboardLoading() {
  return (
    <section
      aria-label="Loading dashboard content"
      className="animate-pulse rounded-xl bg-white p-8 shadow-sm"
    >
      <div className="h-4 w-32 rounded bg-slate-200" />

      <div className="mt-4 h-9 w-64 rounded bg-slate-200" />

      <div className="mt-3 h-5 w-full max-w-md rounded bg-slate-200" />

      <div className="mt-8 grid gap-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 p-5"
          >
            <div className="h-5 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-32 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </section>
  );
}