const batches = [
  {
    id: "batch-001",
    name: "AI Engineering — Morning",
    course: "AI Engineering",
    schedule: "7:00 AM – 9:00 AM",
    students: 8,
    capacity: 10,
  },
  {
    id: "batch-002",
    name: "Data Science — Afternoon",
    course: "Data Science",
    schedule: "2:00 PM – 4:00 PM",
    students: 10,
    capacity: 15,
  },
  {
    id: "batch-003",
    name: "Cybersecurity — Evening",
    course: "Cybersecurity",
    schedule: "5:00 PM – 7:00 PM",
    students: 12,
    capacity: 12,
  },
];

export default function BatchesPage() {
  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Batch management
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Batches
      </h1>

      <p className="mt-2 text-slate-600">
        View schedules, capacity, and student occupancy.
      </p>

      <div className="mt-8 grid gap-4">
        {batches.map((batch) => {
          const isFull = batch.students >= batch.capacity;

          return (
            <article
              key={batch.id}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {batch.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-600">
                    {batch.course}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Schedule: {batch.schedule}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    isFull
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isFull ? "Full" : "Available"}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Occupancy
                  </span>

                  <span className="font-medium text-slate-900">
                    {batch.students}/{batch.capacity}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}