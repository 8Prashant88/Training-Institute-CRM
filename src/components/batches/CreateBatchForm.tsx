"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { submitBatch } from "@/actions/create-batch";
import Button from "@/components/ui/Button";
import {
  Input,
  Select,
} from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type CourseOption = {
  id: string;
  title: string;
  duration: string;
};

type CreateBatchFormProps = {
  courses: CourseOption[];
};

type BatchFormValues = {
  courseId: string;
  title: string;
  capacity: string;
  startDate: string;
  endDate: string;
};

type FieldErrors = Partial<
  Record<keyof BatchFormValues, string>
>;

const initialValues: BatchFormValues = {
  courseId: "",
  title: "",
  capacity: "",
  startDate: "",
  endDate: "",
};

export default function CreateBatchForm({
  courses,
}: CreateBatchFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] =
    useState<BatchFormValues>(initialValues);

  const [fieldErrors, setFieldErrors] =
    useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const submissionLockRef = useRef(false);

  const todayDateValue = new Date().toISOString().slice(0, 10);

  function updateField(
    field: keyof BatchFormValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result = await submitBatch(values);

      if (!result.success) {
        setFieldErrors(
          result.fieldErrors,
        );

        toast({
          variant: "error",
          title: "Batch not created",
          description: result.message,
        });

        return;
      }

      setValues(initialValues);

      toast({
        variant: "success",
        title: "Batch created",
        description: `${result.data.title} was added successfully.`,
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Batch creation failed",
        error,
      );

      toast({
        variant: "error",
        title: "Batch not created",
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
          Create a batch
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Schedule a new upcoming course batch.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="batch-course"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Course
          </label>

          <Select
            id="batch-course"
            value={values.courseId}
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.courseId,
            )}
            onChange={(event) =>
              updateField(
                "courseId",
                event.target.value,
              )
            }
          >
            <option value="">
              Select course
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.title} —{" "}
                {course.duration}
              </option>
            ))}
          </Select>

          {fieldErrors.courseId && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.courseId}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Batch title
          </label>

          <Input
            id="batch-title"
            value={values.title}
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.title,
            )}
            placeholder="AI Engineering — August 2026"
            onChange={(event) =>
              updateField(
                "title",
                event.target.value,
              )
            }
          />

          {fieldErrors.title && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-capacity"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Capacity
          </label>

          <Input
            id="batch-capacity"
            type="number"
            min={1}
            max={500}
            step={1}
            value={values.capacity}
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.capacity,
            )}
            placeholder="20"
            onChange={(event) =>
              updateField(
                "capacity",
                event.target.value,
              )
            }
          />

          {fieldErrors.capacity && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.capacity}
            </p>
          )}
        </div>

        <div className="hidden md:block" />

        <div>
          <label
            htmlFor="batch-start-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Start date
          </label>

          <Input
            id="batch-start-date"
            type="date"
            value={values.startDate}
            min={todayDateValue}
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.startDate,
            )}
            onChange={(event) =>
              updateField(
                "startDate",
                event.target.value,
              )
            }
          />

          {fieldErrors.startDate && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.startDate}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="batch-end-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            End date
          </label>

          <Input
            id="batch-end-date"
            type="date"
            value={values.endDate}
            min={
              values.startDate ||
              undefined
            }
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.endDate,
            )}
            onChange={(event) =>
              updateField(
                "endDate",
                event.target.value,
              )
            }
          />

          {fieldErrors.endDate && (
            <p
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={courses.length === 0}
        >
          {isSubmitting
            ? "Creating batch..."
            : "Create batch"}
        </Button>
      </div>

      {courses.length === 0 && (
        <p className="mt-3 text-right text-sm text-red-600">
          No active courses are available.
        </p>
      )}
    </form>
  );
}