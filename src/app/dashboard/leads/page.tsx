import Link from "next/link";
import LeadStatusBadge from "@/components/LeadStatusBadge";
import { leads } from "@/data/leads";

export default function LeadsPage() {
  return (
    <div className="grid gap-6">
      <section className="rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          Lead management
        </p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-[#001B31] sm:text-3xl">
              Leads
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              View and manage inquiries received by the institute.
            </p>
          </div>

          <p className="shrink-0 text-sm text-slate-500">
            {leads.length} total leads
          </p>
        </div>
      </section>

      {/* Mobile and tablet cards */}
      <section
        aria-label="Lead cards"
        className="grid gap-4 sm:grid-cols-2 lg:hidden"
      >
        {leads.map((lead) => (
          <article
            key={lead.id}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-lg font-semibold text-[#001B31]">
                  {lead.fullName}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-600">
                  {lead.email}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {lead.phone}
                </p>
              </div>

              <div className="shrink-0">
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>

            <dl className="mt-5 border-t border-slate-100 pt-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Interested course
                </dt>

                <dd className="mt-1 break-words text-sm font-medium text-slate-800">
                  {lead.course}
                </dd>
              </div>
            </dl>

            <Link
              href={`/dashboard/leads/${lead.id}`}
              className="mt-5 block rounded-lg bg-[#001B31] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2"
            >
              View details
            </Link>
          </article>
        ))}
      </section>

      {/* Desktop table */}
      <section
        aria-labelledby="desktop-lead-table"
        className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block"
      >
        <h2 id="desktop-lead-table" className="sr-only">
          Lead table
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">
              Training institute inquiries and their current status
            </caption>

            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Lead
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Phone
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Course
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="max-w-64 px-5 py-4 align-top">
                    <p className="break-words font-medium text-[#001B31]">
                      {lead.fullName}
                    </p>

                    <p className="mt-1 break-all text-sm text-slate-500">
                      {lead.email}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top text-sm text-slate-700">
                    {lead.phone}
                  </td>

                  <td className="max-w-56 break-words px-5 py-4 align-top text-sm text-slate-700">
                    {lead.course}
                  </td>

                  <td className="px-5 py-4 align-top">
                    <LeadStatusBadge status={lead.status} />
                  </td>

                  <td className="px-5 py-4 text-right align-top">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#001B31] hover:text-[#001B31] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}