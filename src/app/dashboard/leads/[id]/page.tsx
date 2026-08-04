import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import EditLeadForm from "@/components/EditLeadForm";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import LeadDetailHeader from "@/components/leads/LeadDetailHeader";
import LeadNotesList from "@/components/leads/LeadNotesList";
import LeadOverview from "@/components/leads/LeadOverview";
import Tabs from "@/components/ui/Tabs";
import { listActiveCourses } from "@/services/course-service";
import { getLeadById } from "@/services/lead-service";
import { listActiveCounselors } from "@/services/user-service";

type LeadDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: LeadDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const lead = await getLeadById(id);

    return {
      title: lead
        ? lead.fullName
        : "Lead not found",
    };
  } catch {
    return {
      title: "Lead not found",
    };
  }
}

export default async function LeadDetailPage({
  params,
}: LeadDetailPageProps) {
  const { id } = await params;

  const [lead, courses, counselors] =
    await Promise.all([
      getLeadById(id),
      listActiveCourses(),
      listActiveCounselors(),
    ]);

  if (!lead) {
    notFound();
  }

  const initialData = {
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    interestedCourseId:
      lead.interestedCourseId,
    assignedCounselorId:
      lead.assignedCounselor?.id ?? "",
  };

  const courseOptions = courses.map(
    (course) => ({
      id: course.id,
      title: course.title,
    }),
  );

  return (
    <div className="grid min-w-0 gap-6">
      <Link
        href="/dashboard/leads"
        className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />

        Back to leads
      </Link>

      <LeadDetailHeader lead={lead} />

      <Tabs
        tabs={[
          {
            key: "overview",
            label: "Overview",
            content: (
              <LeadOverview lead={lead} />
            ),
          },
          {
            key: "notes",
            label: `Notes (${lead.notes.length})`,
            content: (
              <LeadNotesList
                notes={lead.notes}
              />
            ),
          },
          {
            key: "activity",
            label: "Activity",
            content: (
              <LeadActivityTimeline
                lead={lead}
              />
            ),
          },
          {
            key: "edit",
            label: "Edit details",
            content: (
              <EditLeadForm
                leadId={lead.id}
                initialData={initialData}
                courses={courseOptions}
                counselors={counselors}
              />
            ),
          },
        ]}
      />
    </div>
  );
}