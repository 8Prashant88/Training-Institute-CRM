import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ArchiveLeadButton from "@/components/leads/ArchiveLeadButton";
import EditLeadForm from "@/components/EditLeadForm";
import EnrollLeadForm from "@/components/leads/EnrollLeadForm";
import LeadActivityTimeline from "@/components/leads/LeadActivityTimeline";
import LeadDetailHeader from "@/components/leads/LeadDetailHeader";
import LeadNoteForm from "@/components/leads/LeadNoteForm";
import LeadNotesList from "@/components/leads/LeadNotesList";
import LeadOverview from "@/components/leads/LeadOverview";
import Tabs from "@/components/ui/Tabs";

import {
  canAccessLead,
  isAdmin,
} from "@/lib/authorization";

import {
  listEnrollmentBatchOptions,
} from "@/services/batch-service";

import {
  listActiveCourses,
} from "@/services/course-service";

import {
  getLeadActivity,
  getLeadById,
} from "@/services/lead-service";

import {
  getCurrentAuthenticatedUser,
  listActiveCounselors,
} from "@/services/user-service";

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
    const currentUser =
      await getCurrentAuthenticatedUser();

    if (!currentUser) {
      return {
        title: "Lead not found",
      };
    }

    const lead = await getLeadById(id);

    if (!lead) {
      return {
        title: "Lead not found",
      };
    }

    const hasAccess = canAccessLead(
      currentUser,
      lead.assignedCounselor?.id ?? null,
    );

    if (!hasAccess) {
      return {
        title: "Lead not found",
      };
    }

    return {
      title: lead.fullName,
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

  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    notFound();
  }

  const lead = await getLeadById(id);

  if (!lead) {
    notFound();
  }

  const hasAccess = canAccessLead(
    currentUser,
    lead.assignedCounselor?.id ?? null,
  );

  if (!hasAccess) {
    notFound();
  }

  const canManageAssignments =
    isAdmin(currentUser);

  const [
    courses,
    counselors,
    enrollmentBatches,
    activities,
  ] = await Promise.all([
    listActiveCourses(),

    canManageAssignments
      ? listActiveCounselors()
      : Promise.resolve([]),

    listEnrollmentBatchOptions(),

    getLeadActivity(lead.id),
  ]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        {isAdmin(currentUser) && (
          <ArchiveLeadButton
            leadId={lead.id}
            leadName={lead.fullName}
          />
        )}
      </div>

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
            key: "enrollment",

            label:
              lead.status === "ENROLLED"
                ? "Enrollment"
                : "Enroll lead",

            content: (
              <EnrollLeadForm
                leadId={lead.id}
                leadName={lead.fullName}
                currentStatus={lead.status}
                batches={
                  enrollmentBatches
                }
              />
            ),
          },

          {
            key: "notes",

            label: `Notes (${lead.notes.length})`,

            content: (
              <div className="grid gap-6">
                <LeadNoteForm
                  leadId={lead.id}
                />

                <LeadNotesList
                  notes={lead.notes}
                />
              </div>
            ),
          },

          {
            key: "activity",
            label: "Activity",

            content: (
              <LeadActivityTimeline
                activities={activities}
                createdAt={lead.createdAt}
                source={lead.source}
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
                canManageAssignments={
                  canManageAssignments
                }
              />
            ),
          },
        ]}
      />
    </div>
  );
}