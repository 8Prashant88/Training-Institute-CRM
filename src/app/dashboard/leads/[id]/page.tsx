import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import EditLeadForm from "@/components/EditLeadForm";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import LeadDetailHeader from "@/components/leads/LeadDetailHeader";
import LeadOverview from "@/components/leads/LeadOverview";
import Tabs from "@/components/ui/Tabs";
import { leads } from "@/data/leads";
import type { LeadFormData } from "@/schemas/lead-schema";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lead = leads.find((currentLead) => currentLead.id === id);

  return { title: lead ? lead.fullName : "Lead not found" };
}

export default async function LeadDetailPage({
  params,
}: LeadDetailPageProps) {
  const { id } = await params;

  const lead = leads.find((currentLead) => currentLead.id === id);

  if (!lead) {
    notFound();
  }

  const initialData: LeadFormData = {
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    interestedCourse: lead.interestedCourse,
  };

  return (
    <div className="grid min-w-0 gap-6">
      <Link
        href="/dashboard/leads"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:rounded-md"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to leads
      </Link>

      <LeadDetailHeader lead={lead} />

      <Tabs
        tabs={[
          {
            key: "overview",
            label: "Overview",
            content: <LeadOverview lead={lead} />,
          },
          {
            key: "activity",
            label: "Activity",
            content: <LeadActivityTimeline lead={lead} />,
          },
          {
            key: "edit",
            label: "Edit details",
            content: (
              <EditLeadForm leadId={lead.id} initialData={initialData} />
            ),
          },
        ]}
      />
    </div>
  );
}
