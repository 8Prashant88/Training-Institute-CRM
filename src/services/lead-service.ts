import "server-only";

import {
  LeadActivityType as DatabaseLeadActivityType,
  LeadSource as DatabaseLeadSource,
  LeadStatus as DatabaseLeadStatus,
  UserRole
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getLeadStatusTransitionRequirement,
  isFollowUpDateOnOrAfterToday,
  requiresFollowUpDate,
  requiresNote,
} from "@/lib/lead-status-rules";
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

export type LeadStatusChangeErrorCode =
  | "LEAD_NOT_FOUND"
  | "FORBIDDEN"
  | "INVALID_TRANSITION"
  | "NOTE_REQUIRED"
  | "FOLLOW_UP_DATE_REQUIRED"
  | "FOLLOW_UP_DATE_IN_PAST";

export class LeadStatusChangeError extends Error {
  readonly code: LeadStatusChangeErrorCode;

  constructor(code: LeadStatusChangeErrorCode, message: string) {
    super(message);

    this.name = "LeadStatusChangeError";
    this.code = code;
  }
}

export type ChangeLeadStatusInput = {
  leadId: string;
  toStatus: DatabaseLeadStatus;

  actor: {
    id: string;
    role: UserRole;
  };

  note?: string | null;
  nextFollowUpAt?: Date | null;
};

export type ScheduleLeadFollowUpErrorCode =
  | "LEAD_NOT_FOUND"
  | "FORBIDDEN"
  | "LEAD_NOT_ELIGIBLE"
  | "FOLLOW_UP_DATE_IN_PAST";

export class ScheduleLeadFollowUpError extends Error {
  readonly code: ScheduleLeadFollowUpErrorCode;

  constructor(code: ScheduleLeadFollowUpErrorCode, message: string) {
    super(message);

    this.name = "ScheduleLeadFollowUpError";
    this.code = code;
  }
}

export type ScheduleLeadFollowUpInput = {
  leadId: string;

  actor: {
    id: string;
    role: UserRole;
  };

  /** null clears the scheduled follow-up date. */
  nextFollowUpAt: Date | null;
  note?: string | null;
};

export type ScheduledLeadFollowUp = {
  id: string;
  nextFollowUpAt: string | null;
};

export type LeadActivityDetails = {
  id: string;
  type: DatabaseLeadActivityType;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  previousFollowUpAt: string | null;
  nextFollowUpAt: string | null;
  note: string | null;
  createdAt: string;
  changedBy: {
    id: string;
    fullName: string;
  };
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
  input: ChangeLeadStatusInput,
): Promise<UpdatedLeadStatus> {
  return prisma.$transaction(async (transaction) => {
    const lead = await transaction.lead.findFirst({
      where: {
        id: input.leadId,
        archivedAt: null,
      },

      select: {
        id: true,
        status: true,
        assignedCounselorId: true,
      },
    });

    if (!lead) {
      throw new LeadStatusChangeError(
        "LEAD_NOT_FOUND",
        "The lead was not found or has been archived.",
      );
    }

    /*
     * Re-checked here, inside the transaction, against the lead's
     * CURRENT assignment — not just the snapshot the server action
     * looked up before calling this function. Closes the window where
     * an admin could reassign the lead between that earlier check and
     * this write.
     */
    const canAccess =
      input.actor.role === UserRole.ADMIN ||
      lead.assignedCounselorId === input.actor.id;

    if (!canAccess) {
      throw new LeadStatusChangeError(
        "FORBIDDEN",
        "You are not authorized to update this lead.",
      );
    }

    const requirement = getLeadStatusTransitionRequirement(
      lead.status,
      input.toStatus,
    );

    if (requirement === "BLOCKED") {
      throw new LeadStatusChangeError(
        "INVALID_TRANSITION",
        `A lead cannot move from ${lead.status} to ${input.toStatus}.`,
      );
    }

    if (requiresNote(requirement) && !input.note?.trim()) {
      throw new LeadStatusChangeError(
        "NOTE_REQUIRED",
        "A note explaining this change is required.",
      );
    }

    if (requiresFollowUpDate(requirement)) {
      if (!input.nextFollowUpAt) {
        throw new LeadStatusChangeError(
          "FOLLOW_UP_DATE_REQUIRED",
          "A next follow-up date is required to move this lead to Follow-up.",
        );
      }

      if (!isFollowUpDateOnOrAfterToday(input.nextFollowUpAt)) {
        throw new LeadStatusChangeError(
          "FOLLOW_UP_DATE_IN_PAST",
          "The follow-up date cannot be in the past.",
        );
      }
    }

    const setsFollowUpDate = input.toStatus === DatabaseLeadStatus.FOLLOW_UP;

    const updatedLead = await transaction.lead.update({
      where: {
        id: input.leadId,
      },

      data: {
        status: input.toStatus,

        ...(setsFollowUpDate
          ? { nextFollowUpAt: input.nextFollowUpAt }
          : {}),
      },

      select: {
        id: true,
        status: true,
      },
    });

    await transaction.leadActivity.create({
      data: {
        leadId: input.leadId,
        type: DatabaseLeadActivityType.STATUS_CHANGE,
        fromStatus: lead.status,
        toStatus: input.toStatus,
        note: input.note?.trim() || null,
        changedById: input.actor.id,

        ...(setsFollowUpDate
          ? { nextFollowUpAt: input.nextFollowUpAt }
          : {}),
      },
    });

    return {
      id: updatedLead.id,
      status: statusLabels[updatedLead.status],
    };
  });
}

export async function scheduleLeadFollowUp(
  input: ScheduleLeadFollowUpInput,
): Promise<ScheduledLeadFollowUp> {
  return prisma.$transaction(async (transaction) => {
    const lead = await transaction.lead.findFirst({
      where: {
        id: input.leadId,
        archivedAt: null,
      },

      select: {
        id: true,
        status: true,
        assignedCounselorId: true,
        nextFollowUpAt: true,
      },
    });

    if (!lead) {
      throw new ScheduleLeadFollowUpError(
        "LEAD_NOT_FOUND",
        "The lead was not found or has been archived.",
      );
    }

    const canAccess =
      input.actor.role === UserRole.ADMIN ||
      lead.assignedCounselorId === input.actor.id;

    if (!canAccess) {
      throw new ScheduleLeadFollowUpError(
        "FORBIDDEN",
        "You are not authorized to update this lead.",
      );
    }

    /*
     * ENROLLED is terminal and LOST must go through the status-change
     * flow (which requires a note explaining the reactivation) instead
     * of a bare follow-up date update.
     */
    if (
      lead.status === DatabaseLeadStatus.ENROLLED ||
      lead.status === DatabaseLeadStatus.LOST
    ) {
      throw new ScheduleLeadFollowUpError(
        "LEAD_NOT_ELIGIBLE",
        "This lead's status does not allow scheduling a follow-up.",
      );
    }

    if (
      input.nextFollowUpAt &&
      !isFollowUpDateOnOrAfterToday(input.nextFollowUpAt)
    ) {
      throw new ScheduleLeadFollowUpError(
        "FOLLOW_UP_DATE_IN_PAST",
        "The follow-up date cannot be in the past.",
      );
    }

    const updatedLead = await transaction.lead.update({
      where: {
        id: input.leadId,
      },

      data: {
        nextFollowUpAt: input.nextFollowUpAt,
      },

      select: {
        id: true,
        nextFollowUpAt: true,
      },
    });

    await transaction.leadActivity.create({
      data: {
        leadId: input.leadId,

        type: input.nextFollowUpAt
          ? DatabaseLeadActivityType.FOLLOW_UP_SCHEDULED
          : DatabaseLeadActivityType.FOLLOW_UP_CLEARED,

        previousFollowUpAt: lead.nextFollowUpAt,
        nextFollowUpAt: input.nextFollowUpAt,
        note: input.note?.trim() || null,
        changedById: input.actor.id,
      },
    });

    return {
      id: updatedLead.id,
      nextFollowUpAt: updatedLead.nextFollowUpAt?.toISOString() ?? null,
    };
  });
}

export async function getLeadActivity(
  leadId: string,
): Promise<LeadActivityDetails[]> {
  const activities = await prisma.leadActivity.findMany({
    where: {
      leadId,
    },

    select: {
      id: true,
      type: true,
      fromStatus: true,
      toStatus: true,
      previousFollowUpAt: true,
      nextFollowUpAt: true,
      note: true,
      createdAt: true,

      changedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    type: activity.type,
    fromStatus: activity.fromStatus
      ? statusLabels[activity.fromStatus]
      : null,
    toStatus: activity.toStatus ? statusLabels[activity.toStatus] : null,
    previousFollowUpAt:
      activity.previousFollowUpAt?.toISOString() ?? null,
    nextFollowUpAt: activity.nextFollowUpAt?.toISOString() ?? null,
    note: activity.note,
    createdAt: activity.createdAt.toISOString(),
    changedBy: activity.changedBy,
  }));
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