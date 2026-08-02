import LeadManager from "@/components/LeadManager";
import { initialLeads } from "@/data/initial-leads";

export default function LeadsPage() {
  return (
    <div className="min-w-0">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          Lead management
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#001B31] sm:text-3xl">
          Manage leads
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Create new leads, validate their contact details,
          filter them by status, and manage them during the
          current session.
        </p>
      </section>

      <LeadManager initialLeads={initialLeads} />
    </div>
  );
}