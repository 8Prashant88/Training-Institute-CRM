"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { submitBatchUpdate } from "@/actions/update-batch";
import { submitBatchStatusUpdate } from "@/actions/update-batch-status";
import Button from "@/components/ui/Button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import {
  batchStatusLabels,
  getAllowedNextBatchStatuses,
  isBatchLocked,
} from "@/lib/batch-status-rules";
import type { BatchStatus } from "@/generated/prisma/client";

type EditValues = {
  title: string;
  capacity: string;
};

type FieldErrors = Partial<Record<keyof EditValues, string>>;

type BatchManagementControlsProps = {
  batchId: string;
  title: string;
  capacity: number;
  enrolledCount: number;
  status: BatchStatus;
};

export default function BatchManagementControls({
  batchId,
  title,
  capacity,
  enrolledCount,
  status,
}: BatchManagementControlsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<EditValues>({
    title,
    capacity: String(capacity),
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [pendingCancellation, setPendingCancellation] = useState(false);
  const [changingStatus, setChangingStatus] = useState<BatchStatus | null>(
    null,
  );

  const saveLockRef = useRef(false);
  const statusLockRef = useRef(false);

  const locked = isBatchLocked(status);
  const nextStatuses = getAllowedNextBatchStatuses(status);

  async function handleSave() {
    if (saveLockRef.current) {
      return;
    }

    saveLockRef.current = true;
    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await submitBatchUpdate({
        batchId,
        title: values.title,
        capacity: values.capacity,
      });

      if (!result.success) {
        setFieldErrors(result.fieldErrors);

        toast({
          variant: "error",
          title: "Batch not updated",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: "Batch updated",
        description: `${result.data.title} was saved successfully.`,
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Batch update failed", error);

      toast({
        variant: "error",
        title: "Batch not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleStatusChange(nextStatus: BatchStatus) {
    if (statusLockRef.current) {
      return;
    }

    statusLockRef.current = true;
    setChangingStatus(nextStatus);

    try {
      const result = await submitBatchStatusUpdate({
        batchId,
        status: nextStatus,
      });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Status not updated",
          description: result.message,
        });

        return;
      }

      setPendingCancellation(false);

      toast({
        variant: "success",
        title: "Status updated",
        description: result.message,
      });

      router.refresh();
    } catch (error) {
      console.error("Batch status update failed", error);

      toast({
        variant: "error",
        title: "Status not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      statusLockRef.current = false;
      setChangingStatus(null);
    }
  }

  if (locked) {
    return (
      <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">
        This batch is {batchStatusLabels[status].toLowerCase()} and can no
        longer be edited.
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      {isEditing ? (
        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Title
            </label>

            <Input
              value={values.title}
              disabled={isSaving}
              invalid={Boolean(fieldErrors.title)}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />

            {fieldErrors.title && (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Capacity
            </label>

            <Input
              type="number"
              min={1}
              max={500}
              value={values.capacity}
              disabled={isSaving}
              invalid={Boolean(fieldErrors.capacity)}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  capacity: event.target.value,
                }))
              }
            />

            {fieldErrors.capacity ? (
              <p role="alert" className="mt-1 text-xs text-red-600">
                {fieldErrors.capacity}
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">
                {enrolledCount} lead(s) already enrolled — capacity cannot go
                below that.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => {
                setIsEditing(false);
                setFieldErrors({});
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              isLoading={isSaving}
              onClick={() => void handleSave()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setValues({ title, capacity: String(capacity) });
              setIsEditing(true);
            }}
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            Edit
          </Button>

          {nextStatuses.map((nextStatus) => (
            <Button
              key={nextStatus}
              type="button"
              variant={nextStatus === "CANCELLED" ? "danger" : "outline"}
              size="sm"
              isLoading={changingStatus === nextStatus}
              onClick={() => {
                if (nextStatus === "CANCELLED") {
                  setPendingCancellation(true);
                  return;
                }

                void handleStatusChange(nextStatus);
              }}
            >
              Mark {batchStatusLabels[nextStatus]}
            </Button>
          ))}
        </div>
      )}

      <ConfirmationDialog
        open={pendingCancellation}
        title={`Cancel ${title}?`}
        description="Cancelling a batch stops it from accepting new enrollments. This cannot be undone — a new batch must be created to reopen the schedule."
        confirmLabel={changingStatus ? "Cancelling..." : "Cancel batch"}
        cancelLabel="Keep batch"
        tone="danger"
        onCancel={() => {
          if (!changingStatus) {
            setPendingCancellation(false);
          }
        }}
        onConfirm={() => {
          void handleStatusChange("CANCELLED");
        }}
      />
    </div>
  );
}
