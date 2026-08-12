"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { submitCourse } from "@/actions/create-course";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

type CourseFormValues = {
  title: string;
  duration: string;
};

type FieldErrors = Partial<Record<keyof CourseFormValues, string>>;

const initialValues: CourseFormValues = {
  title: "",
  duration: "",
};

export default function CreateCourseForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [values, setValues] = useState<CourseFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submissionLockRef = useRef(false);

  function updateField(field: keyof CourseFormValues, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result = await submitCourse(values);

      if (!result.success) {
        setFieldErrors(result.fieldErrors);

        toast({
          variant: "error",
          title: "Course not created",
          description: result.message,
        });

        return;
      }

      setValues(initialValues);

      toast({
        variant: "success",
        title: "Course created",
        description: `${result.data.title} was added successfully.`,
      });

      router.refresh();
    } catch (error) {
      console.error("Course creation failed", error);

      toast({
        variant: "error",
        title: "Course not created",
        description: "An unexpected error occurred. Please try again.",
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
          Add a course
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          New courses start as active and can be used for batches right away.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="course-title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Course title
          </label>

          <Input
            id="course-title"
            value={values.title}
            disabled={isSubmitting}
            invalid={Boolean(fieldErrors.title)}
            placeholder="Full-Stack Web Development"
            onChange={(event) => updateField("title", event.target.value)}
          />

          {fieldErrors.title && (
            <p role="alert" className="mt-1.5 text-sm text-red-600">
              {fieldErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="course-duration"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Duration
          </label>

          <Input
            id="course-duration"
            value={values.duration}
            disabled={isSubmitting}
            invalid={Boolean(fieldErrors.duration)}
            placeholder="12 weeks"
            onChange={(event) => updateField("duration", event.target.value)}
          />

          {fieldErrors.duration && (
            <p role="alert" className="mt-1.5 text-sm text-red-600">
              {fieldErrors.duration}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Adding course..." : "Add course"}
        </Button>
      </div>
    </form>
  );
}
