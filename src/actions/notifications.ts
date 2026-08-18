"use server";

import * as z from "zod";

import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationListItem,
} from "@/services/notification-service";

export type { NotificationListItem } from "@/services/notification-service";

export type ListMyNotificationsResult = {
  notifications: NotificationListItem[];
  unreadCount: number;
};

export async function getMyNotifications(): Promise<ListMyNotificationsResult> {
  const notifications = await listMyNotifications();

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.readAt)
      .length,
  };
}

export type NotificationActionResult =
  | { success: true }
  | { success: false; message: string };

export async function markNotificationAsRead(
  notificationId: string,
): Promise<NotificationActionResult> {
  const result = z.uuid().safeParse(notificationId);

  if (!result.success) {
    return {
      success: false,
      message: "The notification could not be found.",
    };
  }

  try {
    await markNotificationRead(result.data);

    return { success: true };
  } catch (error) {
    console.error("markNotificationAsRead failed", error);

    return {
      success: false,
      message: "Could not mark the notification as read. Please try again.",
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<NotificationActionResult> {
  try {
    await markAllNotificationsRead();

    return { success: true };
  } catch (error) {
    console.error("markAllNotificationsAsRead failed", error);

    return {
      success: false,
      message: "Could not mark notifications as read. Please try again.",
    };
  }
}
