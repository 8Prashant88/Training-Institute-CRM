"use client";

import { useState } from "react";

import { changeLeadStatus } from "@/actions/update-lead-status";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

import {
  getLeadStatusTransitionRequirement,
  requiresFollowUpDate,
  requiresNote,
} from "@/lib/lead-status-rules";

import { leadStatusLabels, type LeadStatus } from "@/types/lead";

type ChangeLeadStatusDialogProps = {
  open: boolean;
  leadId: string;
  leadName: string;
  currentStatus: LeadStatus;

  /** The status the user picked before the dialog opened. */
  targetStatus: LeadStatus | null;

  onClose: () => void;
  onSuccess: (newStatus: LeadStatus) => void;
};

function defaultFollowUpValue(): string {
  const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${inOneHour.getFullYear()}-${pad(inOneHour.getMonth() + 1)}-${pad(
    inOneHour.getDate(),
  )}T${pad(inOneHour.getHours())}:${pad(inOneHour.getMinutes())}`;
}

export default function ChangeLeadStatusDialog({
  open,
  leadId,
  leadName,
  currentStatus,
  targetStatus,
  onClose,
  onSuccess,
}: ChangeLeadStatusDialogProps) {
  const { toast } = useToast();

  const requirement = targetStatus
    ? getLeadStatusTransitionRequirement(currentStatus, targetStatus)
    : "BLOCKED";

  const needsNote = requiresNote(requirement);
  const needsDate = requiresFollowUpDate(requirement);
  const isBlocked = requirement === "BLOCKED";

  /*
   * The parent gives this component a fresh `key` every time it opens
   * with a new target (see LeadDetailHeader/LeadPipelineBoard), so a
   * full remount — not an effect — is what resets these fields for
   * each open. https://react.dev/learn/you-might-not-need-an-effect
   */
  const [note, setNote] = useState("");
  const [nextFollowUpAt, setNextFollowUpAt] = useState(() =>
    needsDate ? defaultFollowUpValue() : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    note?: string;
    nextFollowUpAt?: string;
  }>({});

  if (!open || !targetStatus) {
    return null;
  }

  async function handleConfirm() {
    if (isBlocked || !targetStatus) {
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result = await changeLeadStatus({
        leadId,
        status: targetStatus,
        note: note.trim() || undefined,
        nextFollowUpAt: nextFollowUpAt || undefined,
      });

      if (!result.success) {
        setFieldErrors({
          note: result.fieldErrors.note,
          nextFollowUpAt: result.fieldErrors.nextFollowUpAt,
        });

        toast({
          variant: "error",
          title: "Status not updated",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: "Status updated",
        description: `${leadName} is now marked as ${
          leadStatusLabels[result.data.status]
        }.`,
      });

      onSuccess(result.data.status);
    } catch (error) {
      console.error("Status change failed", error);

      toast({
        variant: "error",
        title: "Status not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      titleId="change-status-title"
      descriptionId="change-status-description"
    >
      <h2
        id="change-status-title"
        className="text-xl font-semibold text-primary-900"
      >
        Move {leadName} to {leadStatusLabels[targetStatus]}?
      </h2>

      <p
        id="change-status-description"
        className="mt-2 text-sm leading-6 text-slate-600"
      >
        {leadStatusLabels[currentStatus]} → {leadStatusLabels[targetStatus]}
      </p>

      <div className="mt-5 grid gap-4">
        {isBlocked && (
          <p className="text-sm text-red-600">
            This lead cannot move directly from{" "}
            {leadStatusLabels[currentStatus]} to{" "}
            {leadStatusLabels[targetStatus]}.
          </p>
        )}

        {needsDate && (
          <div>
            <label
              htmlFor="change-status-follow-up"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Next follow-up (required)
            </label>

            <Input
              id="change-status-follow-up"
              type="datetime-local"
              value={nextFollowUpAt}
              disabled={isSubmitting}
              invalid={Boolean(fieldErrors.nextFollowUpAt)}
              onChange={(event) => setNextFollowUpAt(event.target.value)}
            />

            {fieldErrors.nextFollowUpAt && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.nextFollowUpAt}
              </p>
            )}
          </div>
        )}

        {needsNote && (
          <div>
            <label
              htmlFor="change-status-note"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Note (required)
            </label>

            <Textarea
              id="change-status-note"
              rows={3}
              maxLength={2000}
              value={note}
              disabled={isSubmitting}
              invalid={Boolean(fieldErrors.note)}
              placeholder={
                currentStatus === "LOST"
                  ? "Why is this lead being reactivated?"
                  : "Add context for this change..."
              }
              onChange={(event) => setNote(event.target.value)}
            />

            {fieldErrors.note && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {fieldErrors.note}
              </p>
            )}
          </div>
        )}

        {!needsNote && !needsDate && !isBlocked && (
          <p className="text-sm text-slate-500">
            This move needs no extra details.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>

        <Button
          isLoading={isSubmitting}
          disabled={isBlocked}
          onClick={() => void handleConfirm()}
        >
          {isSubmitting ? "Saving..." : "Confirm"}
        </Button>
      </div>
    </Dialog>
  );
}
