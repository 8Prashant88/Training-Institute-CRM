import "server-only";

import {
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  UserRole
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";
import type {
  AuthenticatedCrmUser,
} from "@/services/user-service";

export type UpdatedLeadStatus = {
  id: string;
  status: LeadStatus;
};
export type ArchivedLead = {
  id: string;
  archivedAt: string;
};

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

export async function listLeads(
  currentUser: Pick<
    AuthenticatedCrmUser,
    "id" | "role"
  >,
): Promise<Lead[]> {
  const databaseLeads =
    await prisma.lead.findMany({
      where: {
        archivedAt: null,

        ...(currentUser.role ===
        UserRole.ADMIN
          ? {}
          : {
              assignedCounselorId:
                currentUser.id,
            }),
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

  return databaseLeads.map(
    (lead) => ({
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email ?? "",
      phone: lead.phone,

      interestedCourse:
        lead.interestedCourse.title,

      status:
        statusLabels[lead.status],

      source:
        sourceLabels[lead.source],

      assignedTo:
        lead.assignedCounselor
          ?.fullName ??
        "Unassigned",

      createdAt:
        lead.createdAt.toISOString(),
    }),
  );
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

export type CreateLeadNoteInput = {
  leadId: string;
  authorId: string;
  note: string;
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

export async function updateLeadStatus(
  id: string,
  status: DatabaseLeadStatus,
): Promise<UpdatedLeadStatus> {
  const updatedLead = await prisma.lead.update({
    where: {
      id,
      archivedAt: null,
    },

    data: {
      status,
    },

    select: {
      id: true,
      status: true,
    },
  });

  return {
    id: updatedLead.id,
    status: statusLabels[updatedLead.status],
  };
}

export async function createLeadNote(
  input: CreateLeadNoteInput,
): Promise<LeadNoteDetails> {
  const createdNote =
    await prisma.leadNote.create({
      data: {
        leadId: input.leadId,
        authorId: input.authorId,
        note: input.note.trim(),
      },

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
    });

  return {
    id: createdNote.id,
    note: createdNote.note,
    createdAt:
      createdNote.createdAt.toISOString(),
    author: createdNote.author,
  };
}

export async function archiveLead(
  id: string,
): Promise<ArchivedLead> {
  const archivedAt = new Date();

  const archivedLead =
    await prisma.lead.update({
      where: {
        id,
        archivedAt: null,
      },

      data: {
        archivedAt,
      },

      select: {
        id: true,
        archivedAt: true,
      },
    });

  if (!archivedLead.archivedAt) {
    throw new Error(
      "Lead archive timestamp was not saved.",
    );
  }

  return {
    id: archivedLead.id,
    archivedAt:
      archivedLead.archivedAt.toISOString(),
  };
}