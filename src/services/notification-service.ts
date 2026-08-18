import "server-only";

import {
  NotificationType,
  UserRole,
  type Prisma,
  type PrismaClient,
} from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentAuthenticatedUser } from "@/services/user-service";


type Db = PrismaClient | Prisma.TransactionClient;

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  leadId: string | null;
  readAt: string | null;
  createdAt: string;
};

const NOTIFICATION_LIST_LIMIT = 20;

async function getActiveAdminIds(db: Db): Promise<string[]> {
  const admins = await db.user.findMany({
    where: {
      role: UserRole.ADMIN,
      isActive: true,
    },

    select: {
      id: true,
    },
  });

  return admins.map((admin) => admin.id);
}

type NotifyLeadInput = {
  id: string;
  fullName: string;
};

export async function notifyAdminsOfNewInquiry(
  db: Db,
  lead: NotifyLeadInput,
  courseTitle: string,
): Promise<void> {
  const adminIds = await getActiveAdminIds(db);

  if (adminIds.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: adminIds.map((userId) => ({
      userId,
      type: NotificationType.NEW_INQUIRY,
      title: `New inquiry: ${lead.fullName}`,
      body: `${lead.fullName} inquired about ${courseTitle}. Assign a counselor to follow up.`,
      leadId: lead.id,
    })),
  });
}

export async function notifyCounselorAssigned(
  db: Db,
  lead: NotifyLeadInput,
  counselorId: string,
): Promise<void> {
  await db.notification.create({
    data: {
      userId: counselorId,
      type: NotificationType.LEAD_ASSIGNED,
      title: "New lead assigned to you",
      body: `${lead.fullName} has been assigned to you. Reach out to get things moving.`,
      leadId: lead.id,
    },
  });
}

export type NotifyLeadEnrolledInput = {
  lead: NotifyLeadInput & {
    assignedCounselorId: string | null;
  };

  courseTitle: string;
  batchTitle: string;
  actorId: string;
};

export async function notifyLeadEnrolled(
  db: Db,
  input: NotifyLeadEnrolledInput,
): Promise<void> {
  const adminIds = await getActiveAdminIds(db);

  const recipientIds = new Set(adminIds);

  if (input.lead.assignedCounselorId) {
    recipientIds.add(input.lead.assignedCounselorId);
  }

  /*
   * Nobody needs a notification about the action they just took
   * themselves, whether that's an admin or the assigned counselor.
   */
  recipientIds.delete(input.actorId);

  if (recipientIds.size === 0) {
    return;
  }

  await db.notification.createMany({
    data: Array.from(recipientIds).map((userId) => ({
      userId,
      type: NotificationType.LEAD_ENROLLED,
      title: `New enrollment: ${input.lead.fullName}`,
      body: `${input.lead.fullName} enrolled in ${input.courseTitle} (${input.batchTitle}).`,
      leadId: input.lead.id,
    })),
  });
}

/*
 * Everything below reads or mutates notifications on behalf of "the
 * current viewer" and always resolves that viewer server-side via
 * getCurrentAuthenticatedUser() — never from a caller-supplied id —
 * so one signed-in user can never read or mark another user's
 * notifications.
 */

export async function listMyNotifications(): Promise<
  NotificationListItem[]
> {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return [];
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId: currentUser.id,
    },

    orderBy: {
      createdAt: "desc",
    },

    take: NOTIFICATION_LIST_LIMIT,

    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      leadId: true,
      readAt: true,
      createdAt: true,
    },
  });

  return notifications.map((notification) => ({
    ...notification,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  }));
}

export async function countUnreadNotifications(
  userId: string,
): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
}

export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: currentUser.id,
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      userId: currentUser.id,
      readAt: null,
    },

    data: {
      readAt: new Date(),
    },
  });
}
