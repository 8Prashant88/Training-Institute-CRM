import {
  CircleUserRound,
  GraduationCap,
  PhoneCall,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, formatRelativeDate } from "@/lib/format";
import type { Lead } from "@/types/lead";

type TimelineEvent = {
  icon: LucideIcon;
  title: string;
  timestamp: string;
  tone: string;
};

function buildTimeline(lead: Lead): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      icon: CircleUserRound,
      title: `Lead captured via ${lead.source}`,
      timestamp: lead.createdAt,
      tone: "bg-blue-100 text-blue-700",
    },
  ];

  if (lead.lastContactedAt) {
    events.push({
      icon: PhoneCall,
      title: `${lead.assignedTo} contacted this lead`,
      timestamp: lead.lastContactedAt,
      tone: "bg-primary-100 text-primary-800",
    });
  }

  if (lead.status === "ENROLLED") {
    events.push({
      icon: GraduationCap,
      title: `Enrolled in ${lead.interestedCourse}`,
      timestamp: lead.lastContactedAt ?? lead.createdAt,
      tone: "bg-green-100 text-green-700",
    });
  }

  if (lead.status === "LOST") {
    events.push({
      icon: XCircle,
      title: "Lead marked as lost",
      timestamp: lead.lastContactedAt ?? lead.createdAt,
      tone: "bg-red-100 text-red-700",
    });
  }

  return events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export default function LeadActivityTimeline({ lead }: { lead: Lead }) {
  const events = buildTimeline(lead);

  return (
    <Card>
      <CardContent>
        <ul className="grid gap-6">
          {events.map((event, index) => {
            const Icon = event.icon;

            return (
              <li key={`${event.title}-${event.timestamp}`} className="relative flex gap-4">
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
