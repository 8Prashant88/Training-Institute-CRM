import Link from "next/link";
import { leads } from "@/data/leads";



export default function LeadsPage() {
  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Lead management
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Leads
      </h1>

      <p className="mt-2 text-slate-600">
        View and manage inquiries received by the institute.
      </p>

      <div className="mt-8 grid gap-4">
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-5"
          >
            <div>
              <h2 className="font-semibold text-slate-900">
                {lead.fullName}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {lead.course}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {lead.status}
              </p>
            </div>

            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}