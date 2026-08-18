"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  UserX,
  Users,
} from "lucide-react";

import { submitEnrollment } from "@/actions/enroll-lead";
import { submitCompleteEnrollment } from "@/actions/complete-enrollment";
import { submitDropEnrollment } from "@/actions/drop-enrollment";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Field from "@/components/ui/Field";
import { Select, Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type {
  BatchStatus,
} from "@/generated/prisma/client";

type EnrollmentBatchOption = {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  capacity: number;
  enrolledCount: number;
  remainingSeats: number;
  startDate: string;
  endDate: string;
  status: BatchStatus;
};

type CurrentEnrollment = {
  id: string;
  batchTitle: string;
  courseTitle: string;
  enrolledAt: string;
};

type EnrollLeadFormProps = {
  leadId: string;
  leadName: string;
  currentEnrollment: CurrentEnrollment | null;
  batches: EnrollmentBatchOption[];
};

export default function EnrollLeadForm({
  leadId,
  leadName,
  currentEnrollment,
  batches,
}: EnrollLeadFormProps) {
  if (currentEnrollment) {
    return (
      <ActiveEnrollmentCard
        leadName={leadName}
        enrollment={currentEnrollment}
      />
    );
  }

  return (
    <EnrollmentPickerForm
      leadId={leadId}
      leadName={leadName}
      batches={batches}
    />
  );
}

function ActiveEnrollmentCard({
  leadName,
  enrollment,
}: {
  leadName: string;
  enrollment: CurrentEnrollment;
}) {
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
      const result = await submitCompleteEnrollment({
        enrollmentId: enrollment.id,
      });

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
        title: "Enrollment completed",
        description: `${leadName} was marked as completed.`,
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
        enrollmentId: enrollment.id,
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
        title: "Student marked as dropped",
        description: `${leadName} was moved back to Follow-up so a counselor can re-engage them.`,
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
    <section className="rounded-xl border border-green-200 bg-green-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
          <GraduationCap aria-hidden="true" className="size-5" />
        </span>

        <div className="min-w-0">
          <h2 className="font-semibold text-green-900">
            Currently enrolled
          </h2>

          <p className="mt-1 text-sm leading-6 text-green-800">
            {leadName} is active in{" "}
            <strong>{enrollment.batchTitle}</strong> (
            {enrollment.courseTitle}), enrolled{" "}
            {formatDate(enrollment.enrolledAt)}.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsDropDialogOpen(true)}
        >
          <UserX aria-hidden="true" className="size-4" />
          Mark dropped
        </Button>

        <Button
          type="button"
          size="sm"
          isLoading={isCompleting}
          onClick={() => void handleComplete()}
        >
          <CheckCircle2 aria-hidden="true" className="size-4" />
          {isCompleting ? "Saving..." : "Mark completed"}
        </Button>
      </div>

      <Dialog
        open={isDropDialogOpen}
        onClose={() => {
          if (!isDropping) {
            setIsDropDialogOpen(false);
          }
        }}
        titleId="drop-enrollment-title"
      >
        <h2
          id="drop-enrollment-title"
          className="text-xl font-semibold text-primary-900"
        >
          Mark {leadName} as dropped?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          This frees their seat in {enrollment.batchTitle} for another
          student and moves {leadName} back into the Follow-up pipeline so a
          counselor can decide whether to re-engage them.
        </p>

        <div className="mt-5">
          <Field id="drop-reason" label="Reason (optional)">
            <Textarea
              id="drop-reason"
              rows={3}
              maxLength={500}
              value={dropReason}
              disabled={isDropping}
              placeholder="e.g. Relocated, scheduling conflict, switching courses..."
              onChange={(event) => setDropReason(event.target.value)}
            />
          </Field>
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
    </section>
  );
}

function EnrollmentPickerForm({
  leadId,
  leadName,
  batches,
}: {
  leadId: string;
  leadName: string;
  batches: EnrollmentBatchOption[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [batchId, setBatchId] =
    useState("");

  const [batchError, setBatchError] =
    useState<string>();

  const [generalError, setGeneralError] =
    useState<string>();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submissionLockRef = useRef(false);

  const selectedBatch = useMemo(
    () =>
      batches.find(
        (batch) => batch.id === batchId,
      ),
    [batchId, batches],
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setBatchError(undefined);
    setGeneralError(undefined);

    try {
      const result =
        await submitEnrollment({
          leadId,
          batchId,
        });

      if (!result.success) {
        setBatchError(
          result.fieldErrors.batchId,
        );

        setGeneralError(
          result.fieldErrors.leadId,
        );

        toast({
          variant: "error",
          title: "Enrollment not completed",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: "Enrollment completed",
        description: `${leadName} was enrolled in ${result.data.batchTitle}.`,
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Enrollment submission failed",
        error,
      );

      toast({
        variant: "error",
        title: "Enrollment not completed",
        description:
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-primary-900">
          Enroll lead
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Select the course batch the lead
          finally decided to join.
        </p>
      </div>

      {generalError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {generalError}
        </div>
      )}

      <div className="mt-5">
        <Field
          id="enrollment-batch"
          label="Available batch"
          error={batchError}
        >
          <Select
            id="enrollment-batch"
            value={batchId}
            disabled={
              isSubmitting ||
              batches.length === 0
            }
            invalid={Boolean(batchError)}
            onChange={(event) => {
              setBatchId(event.target.value);
              setBatchError(undefined);
              setGeneralError(undefined);
            }}
          >
            <option value="">
              Select a batch
            </option>

            {batches.map((batch) => (
              <option
                key={batch.id}
                value={batch.id}
              >
                {batch.courseTitle} —{" "}
                {batch.title} —{" "}
                {batch.remainingSeats} seats left
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {selectedBatch && (
        <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-primary-900">
              {selectedBatch.title}
            </p>

            <p className="text-sm text-slate-600">
              {selectedBatch.courseTitle}
            </p>
          </div>

          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <CalendarDays className="size-3.5" />
                Dates
              </dt>

              <dd className="mt-1 text-slate-700">
                {formatDate(
                  selectedBatch.startDate,
                )}
                {" – "}
                {formatDate(
                  selectedBatch.endDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                <Users className="size-3.5" />
                Occupancy
              </dt>

              <dd className="mt-1 text-slate-700">
                {selectedBatch.enrolledCount} /{" "}
                {selectedBatch.capacity} seats
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Status
              </dt>

              <dd className="mt-1 text-slate-700">
                {selectedBatch.status ===
                "UPCOMING"
                  ? "Upcoming"
                  : "Ongoing"}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Completing enrollment will update
            the lead’s course to{" "}
            <strong>
              {selectedBatch.courseTitle}
            </strong>{" "}
            and set the lead status to Enrolled.
          </p>
        </section>
      )}

      {batches.length === 0 && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            No batches available
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Create an upcoming or ongoing batch
            with available capacity first.
          </p>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={
            batches.length === 0 ||
            !batchId
          }
        >
          {isSubmitting
            ? "Completing enrollment..."
            : "Complete enrollment"}
        </Button>
      </div>
    </form>
  );
}
