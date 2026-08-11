"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { submitScheduleLeadFollowUp } from "@/actions/schedule-lead-follow-up";
import Button, { buttonVariants } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type { LeadStatus } from "@/types/lead";

type LeadFollowUpControlProps = {
  leadId: string;
  leadName: string;
  status: LeadStatus;
  nextFollowUpAt: string | null;
};

function toDatetimeLocalValue(isoDate: string): string {
  const date = new Date(isoDate);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LeadFollowUpControl({
  leadId,
  leadName,
  status,
  nextFollowUpAt,
}: LeadFollowUpControlProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [nextFollowUpValue, setNextFollowUpValue] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    nextFollowUpAt?: string;
  }>({});

  const isEligible = status !== "ENROLLED" && status !== "LOST";

  function openDialog() {
    setNextFollowUpValue(
      nextFollowUpAt ? toDatetimeLocalValue(nextFollowUpAt) : "",
    );
    setNote("");
    setFieldErrors({});
    setIsOpen(true);
  }

  async function submit(nextValue: string | null) {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result = await submitScheduleLeadFollowUp({
        leadId,
        nextFollowUpAt: nextValue,
        note: note.trim() || undefined,
      });

      if (!result.success) {
        setFieldErrors({
          nextFollowUpAt: result.fieldErrors.nextFollowUpAt,
        });

        toast({
          variant: "error",
          title: "Follow-up not updated",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: nextValue ? "Follow-up scheduled" : "Follow-up cleared",
        description: `${leadName}'s follow-up was updated.`,
      });

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Follow-up update failed", error);

      toast({
        variant: "error",
        title: "Follow-up not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isEligible) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <CalendarClock aria-hidden="true" className="size-4" />

        {nextFollowUpAt
          ? `Follow-up: ${formatDate(nextFollowUpAt)}`
          : "Schedule follow-up"}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsOpen(false);
          }
        }}
        titleId="schedule-follow-up-title"
      >
        <h2
          id="schedule-follow-up-title"
          className="text-xl font-semibold text-primary-900"
        >
          Schedule a follow-up
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Set the next time to reach out to {leadName}. This does not change
          their pipeline status.
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <label
              htmlFor="follow-up-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Next follow-up
            </label>

            <Input
              id="follow-up-date"
              type="datetime-local"
              value={nextFollowUpValue}
              disabled={isSubmitting}
              invalid={Boolean(fieldErrors.nextFollowUpAt)}
              onChange={(event) =>
                setNextFollowUpValue(event.target.value)
              }
            />

            {fieldErrors.nextFollowUpAt && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.nextFollowUpAt}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="follow-up-note"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Note (optional)
            </label>

            <Textarea
              id="follow-up-note"
              rows={3}
              maxLength={2000}
              value={note}
              disabled={isSubmitting}
              placeholder="What should the next call cover?"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {nextFollowUpAt ? (
            <Button
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => void submit(null)}
            >
              Clear follow-up
            </Button>
          ) : (
            <span />
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>

            <Button
              isLoading={isSubmitting}
              disabled={!nextFollowUpValue}
              onClick={() => void submit(nextFollowUpValue)}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
