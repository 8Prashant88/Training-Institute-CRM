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
  GraduationCap,
  Users,
} from "lucide-react";

import { submitEnrollment } from "@/actions/enroll-lead";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type {
  LeadStatus,
} from "@/types/lead";
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

type EnrollLeadFormProps = {
  leadId: string;
  leadName: string;
  currentStatus: LeadStatus;
  batches: EnrollmentBatchOption[];
};

export default function EnrollLeadForm({
  leadId,
  leadName,
  currentStatus,
  batches,
}: EnrollLeadFormProps) {
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

  const isAlreadyEnrolled =
    currentStatus === "ENROLLED";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submissionLockRef.current ||
      isAlreadyEnrolled
    ) {
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

  if (isAlreadyEnrolled) {
    return (
      <section className="rounded-xl border border-green-200 bg-green-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <GraduationCap
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <div>
            <h2 className="font-semibold text-green-900">
              Enrollment completed
            </h2>

            <p className="mt-1 text-sm leading-6 text-green-800">
              {leadName} already has an
              enrollment and cannot be enrolled
              twice.
            </p>
          </div>
        </div>
      </section>
    );
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
        <label
          htmlFor="enrollment-batch"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Available batch
        </label>

        <Select
          id="enrollment-batch"
          value={batchId}
          disabled={
            isSubmitting ||
            batches.length === 0
          }
          invalid={Boolean(batchError)}
          aria-describedby={
            batchError
              ? "enrollment-batch-error"
              : undefined
          }
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

        {batchError && (
          <p
            id="enrollment-batch-error"
            role="alert"
            className="mt-1.5 text-sm text-red-600"
          >
            {batchError}
          </p>
        )}
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
                {selectedBatch.enrolledCount}/
                {selectedBatch.capacity}
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