import {
  ArrowRightLeft,
  CalendarClock,
  CalendarX,
  CircleUserRound,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, formatRelativeDate } from "@/lib/format";
import {
  leadStatusLabels,
  type LeadSource,
} from "@/types/lead";
import type { LeadActivityDetails } from "@/services/lead-service";

type TimelineEvent = {
  icon: LucideIcon;
  title: string;
  note: string | null;
  timestamp: string;
  tone: string;
};

function buildEvents(
  activities: LeadActivityDetails[],
  createdAt: string,
  source: LeadSource,
): TimelineEvent[] {
  const activityEvents: TimelineEvent[] = activities.map((activity) => {
    if (activity.type === "STATUS_CHANGE") {
      const fromLabel = activity.fromStatus
        ? leadStatusLabels[activity.fromStatus]
        : "unknown";

      const toLabel = activity.toStatus
        ? leadStatusLabels[activity.toStatus]
        : "unknown";

      return {
        icon: ArrowRightLeft,
        title: `${activity.changedBy.fullName} moved this lead from ${fromLabel} to ${toLabel}`,
        note: activity.note,
        timestamp: activity.createdAt,
        tone: "bg-primary-100 text-primary-800",
      };
    }

    if (activity.type === "FOLLOW_UP_SCHEDULED") {
      return {
        icon: CalendarClock,
        title: activity.nextFollowUpAt
          ? `${activity.changedBy.fullName} scheduled a follow-up for ${formatDate(activity.nextFollowUpAt)}`
          : `${activity.changedBy.fullName} scheduled a follow-up`,
        note: activity.note,
        timestamp: activity.createdAt,
        tone: "bg-accent-50 text-accent-800",
      };
    }

    // FOLLOW_UP_CLEARED
    return {
      icon: CalendarX,
      title: `${activity.changedBy.fullName} cleared the scheduled follow-up`,
      note: activity.note,
      timestamp: activity.createdAt,
      tone: "bg-slate-100 text-slate-600",
    };
  });

  return [
    ...activityEvents,
    {
      icon: CircleUserRound,
      title: `Lead captured via ${source}`,
      note: null,
      timestamp: createdAt,
      tone: "bg-blue-100 text-blue-700",
    },
  ];
}

type LeadActivityTimelineProps = {
  activities: LeadActivityDetails[];
  createdAt: string;
  source: LeadSource;
};

export default function LeadActivityTimeline({
  activities,
  createdAt,
  source,
}: LeadActivityTimelineProps) {
  const events = buildEvents(activities, createdAt, source);

  return (
    <Card>
      <CardContent>
        <ul className="grid gap-6">
          {events.map((event, index) => {
            const Icon = event.icon;

            return (
              <li
                key={`${event.title}-${event.timestamp}-${index}`}
                className="relative flex gap-4"
              >
                {index < events.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-9 h-[calc(100%-0.5rem)] w-px -translate-x-1/2 bg-slate-200"
                  />
                )}

                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${event.tone}`}
                >
                  <Icon className="size-4" />
                </span>

                <div className="min-w-0 pb-1">
                  <p className="text-sm font-medium text-slate-800">
                    {event.title}
                  </p>

                  {event.note && (
                    <p className="mt-1 text-sm text-slate-600">
                      {event.note}
                    </p>
                  )}

                  <p
                    className="mt-0.5 text-xs text-slate-500"
                    title={formatDate(event.timestamp)}
                    suppressHydrationWarning
                  >
                    {formatRelativeDate(event.timestamp)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
