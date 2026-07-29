import Link from "next/link";
import { notFound } from "next/navigation";
import { leads } from "@/data/leads";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LeadDetailPage({
  params,
}: LeadDetailPageProps) {
  const { id } = await params;

  const lead = leads.find(
    (currentLead) => currentLead.id === id,
  );

  if (!lead) {
    notFound();
  }

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Lead details
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {lead.fullName}
          </h1>

          <p className="mt-2 text-slate-600">
            Lead ID: {lead.id}
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {lead.status}
        </span>
      </div>

      <dl className="mt-8 grid gap-5 rounded-xl border border-slate-200 p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-slate-500">Email</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {lead.email}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-slate-500">Phone</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {lead.phone}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-slate-500">
            Interested course
          </dt>
          <dd className="mt-1 font-medium text-slate-900">
            {lead.course}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-slate-500">Status</dt>
          <dd className="mt-1 font-medium text-slate-900">
            {lead.status}
          </dd>
        </div>
      </dl>

      <Link
        href="/dashboard/leads"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to leads
      </Link>
    </section>
  );
}