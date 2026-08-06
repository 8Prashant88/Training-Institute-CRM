"use client";

import {
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  LoaderCircle,
  Mail,
  Phone,
} from "lucide-react";

import { changeLeadStatus } from "@/actions/update-lead-status";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import {
  buttonVariants,
} from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import {
  leadStatusLabels,
  leadStatuses,
  type Lead,
  type LeadStatus,
} from "@/types/lead";

type LeadDetailHeaderProps = {
  lead: Lead;
};

export default function LeadDetailHeader({
  lead,
}: LeadDetailHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] =
    useState<LeadStatus>(lead.status);

  const [isUpdating, setIsUpdating] =
    useState(false);

  const updateLockRef = useRef(false);

  const isEnrolled =
    status === "ENROLLED";

  async function handleStatusChange(
    nextStatus: LeadStatus,
  ) {
    if (
      updateLockRef.current ||
      nextStatus === status
    ) {
      return;
    }

    const previousStatus = status;

    updateLockRef.current = true;
    setIsUpdating(true);

    // Optimistic UI update
    setStatus(nextStatus);

    try {
      const result =
        await changeLeadStatus({
          leadId: lead.id,
          status: nextStatus,
        });

      if (!result.success) {
        setStatus(previousStatus);

        toast({
          variant: "error",
          title: "Status not updated",
          description: result.message,
        });

        return;
      }

      // Use the value confirmed by PostgreSQL.
      setStatus(result.data.status);

      toast({
        variant: "success",
        title: "Status updated",
        description: `${lead.fullName} is now marked as ${
          leadStatusLabels[
            result.data.status
          ]
        }.`,
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Status update failed",
        error,
      );

      setStatus(previousStatus);

      toast({
        variant: "error",
        title: "Status not updated",
        description:
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      updateLockRef.current = false;
      setIsUpdating(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar
            name={lead.fullName}
            size="lg"
          />

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold text-primary-900 sm:text-3xl">
              {lead.fullName}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span>
                Lead ID: {lead.id}
              </span>

              <span>·</span>

              <span>
                Added{" "}
                {formatDate(
                  lead.createdAt,
                )}
              </span>

              <span>·</span>

              <span>
                Source: {lead.source}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="slate">
                Assigned to{" "}
                {lead.assignedTo}
              </Badge>

              {isEnrolled && (
                <Badge tone="green">
                  Enrollment completed
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <label
            className="text-xs font-medium text-slate-500"
            htmlFor="lead-status"
          >
            Pipeline status
          </label>

          <div className="relative">
            <Select
              id="lead-status"
              value={status}
              disabled={
                isUpdating ||
                isEnrolled
              }
              aria-busy={isUpdating}
              onChange={(event) => {
                void handleStatusChange(
                  event.target
                    .value as LeadStatus,
                );
              }}
              className="w-full bg-white pr-10 sm:w-48"
            >
              {leadStatuses.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                    disabled={
                      option ===
                        "ENROLLED" &&
                      status !==
                        "ENROLLED"
                    }
                  >
                    {
                      leadStatusLabels[
                        option
                      ]
                    }
                  </option>
                ),
              )}
            </Select>

            {isUpdating && (
              <LoaderCircle
                aria-hidden="true"
                className="pointer-events-none absolute right-8 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate-500"
              />
            )}
          </div>

          {isUpdating && (
            <p
              role="status"
              className="text-xs text-slate-500"
            >
              Saving status...
            </p>
          )}

          {isEnrolled && (
            <p className="max-w-48 text-right text-xs leading-4 text-slate-500">
              Enrolled status is managed by
              the enrollment record.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
        <a
          href={`mailto:${lead.email}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          <Mail
            aria-hidden="true"
            className="size-4"
          />

          {lead.email}
        </a>

        <a
          href={`tel:${lead.phone}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          <Phone
            aria-hidden="true"
            className="size-4"
          />

          {lead.phone}
        </a>
      </div>
    </div>
  );
}