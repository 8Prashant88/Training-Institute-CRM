import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

const sourceLabels: Record<DatabaseLeadSource, LeadSource> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  WALK_IN: "Walk-in",
  SOCIAL_MEDIA: "Social Media",
  PHONE_INQUIRY: "Phone Inquiry",
  EVENT: "Event",
};

const statusLabels: Record<DatabaseLeadStatus, LeadStatus> = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  FOLLOW_UP: "FOLLOW_UP",
  ENROLLED: "ENROLLED",
  LOST: "LOST",
};

export async function listLeads(): Promise<Lead[]> {
  const databaseLeads = await prisma.lead.findMany({
    where: {
      archivedAt: null,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,

      interestedCourse: {
        select: {
          title: true,
        },
      },

      assignedCounselor: {
        select: {
          fullName: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return databaseLeads.map((lead) => ({
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email ?? "",
    phone: lead.phone,
    interestedCourse: lead.interestedCourse.title,
    status: statusLabels[lead.status],
    source: sourceLabels[lead.source],
    assignedTo:
      lead.assignedCounselor?.fullName ?? "Unassigned",
    createdAt: lead.createdAt.toISOString(),
  }));
}
export type LeadNoteDetails = {
  id: string;
  note: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type LeadDetails = Lead & {
  interestedCourseId: string;
  nextFollowUpAt: string | null;

  assignedCounselor: {
    id: string;
    fullName: string;
    email: string;
  } | null;

  notes: LeadNoteDetails[];
};

export type CreateLeadInput = {
  fullName: string;
  email: string;
  phone: string;
  interestedCourseId: string;
  source: DatabaseLeadSource;
  assignedCounselorId?: string | null;
  inquiryMessage?: string | null;
};

export async function getLeadById(
  id: string,
): Promise<LeadDetails | null> {
  const lead = await prisma.lead.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,
      archivedAt: true,
      nextFollowUpAt: true,

      interestedCourse: {
  select: {
    id: true,
    title: true,
  },
},

      assignedCounselor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },

      notes: {
        select: {
          id: true,
          note: true,
          createdAt: true,

          author: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!lead || lead.archivedAt) {
    return null;
  }

  return {
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email ?? "",
    phone: lead.phone,
    interestedCourseId: lead.interestedCourse.id,
    interestedCourse: lead.interestedCourse.title,
    status: statusLabels[lead.status],
    source: sourceLabels[lead.source],
    assignedTo:
      lead.assignedCounselor?.fullName ?? "Unassigned",
    createdAt: lead.createdAt.toISOString(),

    nextFollowUpAt:
      lead.nextFollowUpAt?.toISOString() ?? null,

    assignedCounselor: lead.assignedCounselor,

    notes: lead.notes.map((note) => ({
      id: note.id,
      note: note.note,
      createdAt: note.createdAt.toISOString(),
      author: note.author,
    })),
  };
}

export async function createLead(
  input: CreateLeadInput,
): Promise<Lead> {
  const createdLead = await prisma.lead.create({
    data: {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      interestedCourseId: input.interestedCourseId,
      source: input.source,
      status: DatabaseLeadStatus.NEW,
      assignedCounselorId:
        input.assignedCounselorId ?? null,
      inquiryMessage:
        input.inquiryMessage?.trim() || null,
    },

    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      source: true,
      status: true,
      createdAt: true,

      interestedCourse: {
        select: {
          title: true,
        },
      },

      assignedCounselor: {
        select: {
          fullName: true,
        },
      },
    },
  });

  return {
    id: createdLead.id,
    fullName: createdLead.fullName,
    email: createdLead.email ?? "",
    phone: createdLead.phone,
    interestedCourse:
      createdLead.interestedCourse.title,
    status: statusLabels[createdLead.status],
    source: sourceLabels[createdLead.source],
    assignedTo:
      createdLead.assignedCounselor?.fullName ??
      "Unassigned",
    createdAt: createdLead.createdAt.toISOString(),
  };
}