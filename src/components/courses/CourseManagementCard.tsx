"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { submitCourseUpdate } from "@/actions/update-course";
import { submitCourseStatusToggle } from "@/actions/toggle-course-status";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { CourseStatus } from "@/generated/prisma/client";

export type CourseManagementCardItem = {
  id: string;
  title: string;
  duration: string;
  status: CourseStatus;
  batchCount: number;
};

type EditValues = {
  title: string;
  duration: string;
};

type FieldErrors = Partial<Record<keyof EditValues, string>>;

export default function CourseManagementCard({
  course,
}: {
  course: CourseManagementCardItem;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<EditValues>({
    title: course.title,
    duration: course.duration,
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);

  const saveLockRef = useRef(false);
  const toggleLockRef = useRef(false);

  const isActive = course.status === "ACTIVE";

  function startEditing() {
    setValues({ title: course.title, duration: course.duration });
    setFieldErrors({});
    setIsEditing(true);
  }

  async function handleSave() {
    if (saveLockRef.current) {
      return;
    }

    saveLockRef.current = true;
    setIsSaving(true);
    setFieldErrors({});

    try {
      const result = await submitCourseUpdate({
        courseId: course.id,
        title: values.title,
        duration: values.duration,
      });

      if (!result.success) {
        setFieldErrors(result.fieldErrors);

        toast({
          variant: "error",
          title: "Course not updated",
          description: result.message,
        });

        return;
      }

      toast({
        variant: "success",
        title: "Course updated",
        description: `${result.data.title} was saved successfully.`,
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Course update failed", error);

      toast({
        variant: "error",
        title: "Course not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      saveLockRef.current = false;
      setIsSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (toggleLockRef.current) {
      return;
    }

    toggleLockRef.current = true;
    setIsTogglingStatus(true);

    try {
      const result = await submitCourseStatusToggle({
        courseId: course.id,
      });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Status not updated",
          description: result.message,
        });

        return;
      }

      setIsConfirmingDeactivate(false);

      toast({
        variant: "success",
        title:
          result.data.status === "ACTIVE"
            ? "Course activated"
            : "Course deactivated",
        description: `${result.data.title} is now ${
          result.data.status === "ACTIVE" ? "active" : "inactive"
        }.`,
      });

      router.refresh();
    } catch (error) {
      console.error("Course status toggle failed", error);

      toast({
        variant: "error",
        title: "Status not updated",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      toggleLockRef.current = false;
      setIsTogglingStatus(false);
    }
  }

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isEditing ? (
            <Field
              id={`course-title-${course.id}`}
              label="Training program"
              error={fieldErrors.title}
              className="mt-1 grid gap-2"
            >
              <Input
                id={`course-title-${course.id}`}
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
            </Field>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Training program
              </p>

              <h2 className="mt-1 text-lg font-semibold text-primary-900">
                {course.title}
              </h2>
            </>
          )}
        </div>

        <Badge tone={isActive ? "green" : "slate"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <dl className="mt-5 text-sm">
        <div>
          {isEditing ? (
            <Field
              id={`course-duration-${course.id}`}
              label="Duration"
              error={fieldErrors.duration}
              className="grid gap-2"
            >
              <Input
                id={`course-duration-${course.id}`}
                value={values.duration}
                disabled={isSaving}
                invalid={Boolean(fieldErrors.duration)}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    duration: event.target.value,
                  }))
                }
              />
            </Field>
          ) : (
            <>
              <dt className="text-xs text-slate-400">Duration</dt>

              <dd className="mt-1 font-medium text-slate-700">
                {course.duration}
              </dd>
            </>
          )}
        </div>

        <div className="mt-3">
          <dt className="text-xs text-slate-400">Batches</dt>

          <dd className="mt-1 font-medium text-slate-700">
            {course.batchCount}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        {isEditing ? (
          <>
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
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={startEditing}
            >
              <Pencil aria-hidden="true" className="size-3.5" />
              Edit
            </Button>

            <Button
              type="button"
              variant={isActive ? "danger" : "outline"}
              size="sm"
              isLoading={isTogglingStatus}
              onClick={() => {
                if (isActive) {
                  setIsConfirmingDeactivate(true);
                  return;
                }

                void handleToggleStatus();
              }}
            >
              {isTogglingStatus
                ? "Saving..."
                : isActive
                  ? "Deactivate"
                  : "Activate"}
            </Button>
          </>
        )}
      </div>

      <ConfirmationDialog
        open={isConfirmingDeactivate}
        title={`Deactivate ${course.title}?`}
        description="Inactive courses can no longer be selected for new batches or new inquiries, but existing batches, leads, and enrollments are unaffected."
        confirmLabel={isTogglingStatus ? "Deactivating..." : "Deactivate course"}
        cancelLabel="Keep active"
        tone="danger"
        onCancel={() => {
          if (!isTogglingStatus) {
            setIsConfirmingDeactivate(false);
          }
        }}
        onConfirm={() => {
          void handleToggleStatus();
        }}
      />
    </Card>
  );
}
