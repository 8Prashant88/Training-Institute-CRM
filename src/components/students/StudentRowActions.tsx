"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserX } from "lucide-react";

import { submitCompleteEnrollment } from "@/actions/complete-enrollment";
import { submitDropEnrollment } from "@/actions/drop-enrollment";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type StudentRowActionsProps = {
  enrollmentId: string;
  studentName: string;
  batchTitle: string;
};

export default function StudentRowActions({
  enrollmentId,
  studentName,
  batchTitle,
}: StudentRowActionsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isCompleting, setIsCompleting] = useState(false);
  const [isDropDialogOpen, setIsDropDialogOpen] = useState(false);
  const [isDropping, setIsDropping] = useState(false);
  const [dropReason, setDropReason] = useState("");

  const actionLockRef = useRef(false);

  async function handleComplete() {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    setIsCompleting(true);

    try {
      const result = await submitCompleteEnrollment({ enrollmentId });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Not updated",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: "Marked completed",
        description: `${studentName} was marked as completed.`,
      });

      router.refresh();
    } catch (error) {
      console.error("Complete enrollment failed", error);

      toast({
        variant: "error",
        title: "Not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      actionLockRef.current = false;
      setIsCompleting(false);
    }
  }

  async function handleDrop() {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    setIsDropping(true);

    try {
      const result = await submitDropEnrollment({
        enrollmentId,
        reason: dropReason.trim() || undefined,
      });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Not updated",
          description: result.message,
        });

        return;
      }

      setIsDropDialogOpen(false);
      setDropReason("");

      toast({
        variant: "success",
        title: "Marked dropped",
        description: `${studentName} was moved back to Follow-up.`,
      });

      router.refresh();
    } catch (error) {
      console.error("Drop enrollment failed", error);

      toast({
        variant: "error",
        title: "Not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      actionLockRef.current = false;
      setIsDropping(false);
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Mark completed"
        aria-label={`Mark ${studentName} as completed`}
        isLoading={isCompleting}
        onClick={() => void handleComplete()}
      >
        <CheckCircle2 aria-hidden="true" className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Mark dropped"
        aria-label={`Mark ${studentName} as dropped`}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setIsDropDialogOpen(true)}
      >
        <UserX aria-hidden="true" className="size-4" />
      </Button>

      <Dialog
        open={isDropDialogOpen}
        onClose={() => {
          if (!isDropping) {
            setIsDropDialogOpen(false);
          }
        }}
        titleId={`drop-student-${enrollmentId}-title`}
      >
        <h2
          id={`drop-student-${enrollmentId}-title`}
          className="text-xl font-semibold text-primary-900"
        >
          Mark {studentName} as dropped?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This frees their seat in {batchTitle} and moves {studentName} back
          into the Follow-up pipeline.
        </p>

        <div className="mt-5">
          <label
            htmlFor={`drop-reason-${enrollmentId}`}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Reason (optional)
          </label>

          <Textarea
            id={`drop-reason-${enrollmentId}`}
            rows={3}
            maxLength={500}
            value={dropReason}
            disabled={isDropping}
            placeholder="e.g. Relocated, scheduling conflict, switching courses..."
            onChange={(event) => setDropReason(event.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            disabled={isDropping}
            onClick={() => setIsDropDialogOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            isLoading={isDropping}
            onClick={() => void handleDrop()}
          >
            {isDropping ? "Saving..." : "Mark dropped"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
