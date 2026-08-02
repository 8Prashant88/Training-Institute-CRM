import type { Metadata } from "next";

import LeadsWorkspace from "@/components/leads/LeadsWorkspace";
import { CardEyebrow } from "@/components/ui/Card";
import { leads } from "@/data/leads";

export const metadata: Metadata = {
  title: "Leads",
};

type LeadsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function LeadsPage({
  searchParams,
}: LeadsPageProps) {
  const { q } = await searchParams;

  return (
    <div className="grid min-w-0 gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>Lead management</CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          Manage leads
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Track inquiries end to end — search, filter by pipeline stage,
          update status in bulk, and open a lead to see full contact
          details.
        </p>
      </section>

      <LeadsWorkspace initialLeads={leads} initialQuery={q ?? ""} />
    </div>
  );
}
