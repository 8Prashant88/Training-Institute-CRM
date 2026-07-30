import DashboardStat from "@/components/DashboardStat";

const dashboardMetrics = [
  {
    label: "Total Leads",
    value: 128,
    description: "All inquiries received",
  },
  {
    label: "New This Week",
    value: 18,
    description: "Leads added in the last seven days",
  },
  {
    label: "Follow-ups Today",
    value: 7,
    description: "Counselor actions due today",
  },
  {
    label: "Active Enrollments",
    value: 46,
    description: "Students in active batches",
  },
];

export default  function DashboardPage() {
    return (
  

    <div className="grid gap-6">
      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          Overview
        </p>

        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#001B31] sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Monitor leads, follow-ups, batches, and enrollment
              activity from one place.
            </p>
          </div>

          <p className="shrink-0 text-sm text-slate-500">
            Sample data for UI development
          </p>
        </div>
      </section>

      <section aria-labelledby="dashboard-statistics">
        <h2
          id="dashboard-statistics"
          className="sr-only"
        >
          Dashboard statistics
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardMetrics.map((metric) => (
            <DashboardStat
              key={metric.label}
              label={metric.label}
              value={metric.value}
              description={metric.description}
            />
          ))}
        </div>
      </section>
    </div>
  );
}