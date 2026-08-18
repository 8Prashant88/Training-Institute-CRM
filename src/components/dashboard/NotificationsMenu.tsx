"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, GraduationCap, UserCheck, UserPlus } from "lucide-react";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationListItem,
} from "@/actions/notifications";

import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { formatRelativeDate } from "@/lib/format";

type NotificationsMenuProps = {
  initialUnreadCount: number;
};

const typeIcon = {
  NEW_INQUIRY: UserPlus,
  LEAD_ASSIGNED: UserCheck,
  LEAD_ENROLLED: GraduationCap,
} as const;

export default function NotificationsMenu({
  initialUnreadCount,
}: NotificationsMenuProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<
    NotificationListItem[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function loadNotifications() {
    setIsLoading(true);

    try {
      const result = await getMyNotifications();

      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggle() {
    const next = !open;

    setOpen(next);

    if (next) {
      void loadNotifications();
    }
  }

  async function handleNotificationClick(notification: NotificationListItem) {
    if (!notification.readAt) {
      const readAt = new Date().toISOString();

      setNotifications(
        (current) =>
          current?.map((item) =>
            item.id === notification.id ? { ...item, readAt } : item,
          ) ?? null,
      );

      setUnreadCount((current) => Math.max(0, current - 1));

      void markNotificationAsRead(notification.id);
    }

    setOpen(false);

    if (notification.leadId) {
      router.push(`/dashboard/leads/${notification.leadId}`);
    }
  }

  async function handleMarkAllRead() {
    if (isMarkingAll || unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);

    const readAt = new Date().toISOString();

    setNotifications(
      (current) =>
        current?.map((item) => ({ ...item, readAt: item.readAt ?? readAt })) ??
        null,
    );

    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
      router.refresh();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        onClick={handleToggle}
        className="relative shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
      >
        <Bell aria-hidden="true" className="size-5" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-semibold text-primary-950 ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-popover)] animate-[var(--animate-fade-in)]"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-900">
              Notifications
            </p>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                disabled={isMarkingAll}
                className="text-xs font-medium text-primary-800 transition hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto p-1.5">
            {isLoading && !notifications ? (
              <div className="grid gap-2 p-2.5">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-sm text-slate-400">
                You&rsquo;re all caught up.
              </p>
            ) : (
              notifications.map((notification) => {
                const Icon = typeIcon[notification.type];
                const isUnread = !notification.readAt;

                return (
                  <button
                    key={notification.id}
                    type="button"
                    role="menuitem"
                    onClick={() => void handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left transition hover:bg-slate-50",
                      isUnread && "bg-primary-50/60",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                        isUnread
                          ? "bg-primary-100 text-primary-800"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate text-sm",
                          isUnread
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700",
                        )}
                      >
                        {notification.title}
                      </span>

                      <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-slate-500">
                        {notification.body}
                      </span>

                      <span
                        className="mt-1 block text-[11px] text-slate-400"
                        suppressHydrationWarning
                      >
                        {formatRelativeDate(notification.createdAt)}
                      </span>
                    </span>

                    {isUnread && (
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
