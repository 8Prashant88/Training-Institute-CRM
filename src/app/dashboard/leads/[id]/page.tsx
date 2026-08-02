import Link from "next/link";
import { notFound } from "next/navigation";

import EditLeadForm from "@/components/EditLeadForm";
import { leads } from "@/data/leads";
import type { LeadFormData } from "@/schemas/lead-schema";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function normalizePhoneNumber(phone: string) {
  const trimmedPhone = phone.trim();

  if (trimmedPhone.startsWith("+")) {
    return trimmedPhone;
  }

  return `+977${trimmedPhone}`;
}

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

  const initialData: LeadFormData = {
    fullName: lead.fullName,
    email: lead.email,
    phone: normalizePhoneNumber(lead.phone),
    interestedCourse: lead.course,
  };

  return (
    <section className="min-w-0">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
              Lead details
            </p>

            <h1 className="mt-2 break-words text-2xl font-bold text-[#001B31] sm:text-3xl">
              {lead.fullName}
            </h1>

            <p className="mt-2 break-all text-sm text-slate-600">
              Lead ID: {lead.id}
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {lead.status}
          </span>
        </div>

        <div className="mt-6">
          <Link
            href="/dashboard/leads"
            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C]"
          >
            ← Back to leads
          </Link>
        </div>
      </div>

      <EditLeadForm
        leadId={lead.id}
        initialData={initialData}
      />
    </section>
  );
}