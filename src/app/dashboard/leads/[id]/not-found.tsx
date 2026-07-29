import Link from "next/link";

export default function LeadNotFound() {
  return (
    <section className="rounded-xl bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        404 error
      </p>

      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        Lead not found
      </h1>

      <p className="mt-2 text-slate-600">
        The requested lead does not exist.
      </p>

      <Link
        href="/dashboard/leads"
        className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Return to leads
      </Link>
    </section>
  );
}