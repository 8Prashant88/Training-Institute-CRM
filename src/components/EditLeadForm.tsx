"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import type {
  Value,
} from "react-phone-number-input";

import * as z from "zod";

import {
  updateLead,
} from "@/actions/update-lead";

import InternationalPhoneField from "@/components/InternationalPhoneField";

import Button from "@/components/ui/Button";

import {
  Card,
  CardContent,
} from "@/components/ui/Card";

import Field from "@/components/ui/Field";

import {
  Input,
  Select,
} from "@/components/ui/Input";

import {
  useToast,
} from "@/components/ui/Toast";

import {
  leadFormSchema,
} from "@/schemas/lead-schema";

import type {
  CounselorOption,
  CourseOption,
} from "@/types/lead-options";

const editLeadSchema = leadFormSchema
  .omit({
    interestedCourse: true,
  })
  .extend({
    interestedCourseId: z.uuid({
      error:
        "Select a valid course.",
    }),

    assignedCounselorId: z.union([
      z.literal(""),

      z.uuid({
        error:
          "Select a valid counselor.",
      }),
    ]),
  });

type EditLeadFormData = z.infer<
  typeof editLeadSchema
>;

type EditLeadInitialData = {
  fullName: string;
  email: string;
  phone: string;
  interestedCourseId: string;
  assignedCounselorId: string;
};

type LeadFieldErrors = Partial<
  Record<
    keyof EditLeadFormData,
    string
  >
>;

type EditLeadFormProps = {
  leadId: string;

  initialData: EditLeadInitialData;

  courses: CourseOption[];

  counselors: CounselorOption[];

  canManageAssignments: boolean;
};

export default function EditLeadForm({
  leadId,
  initialData,
  courses,
  counselors,
  canManageAssignments,
}: EditLeadFormProps) {
  const router = useRouter();

  const { toast } = useToast();

  const [fullName, setFullName] =
    useState(initialData.fullName);

  const [email, setEmail] =
    useState(initialData.email);

  const [phone, setPhone] =
    useState<Value | undefined>(
      initialData.phone as Value,
    );

  const [
    interestedCourseId,
    setInterestedCourseId,
  ] = useState(
    initialData.interestedCourseId,
  );

  const [
    assignedCounselorId,
    setAssignedCounselorId,
  ] = useState(
    initialData.assignedCounselorId,
  );

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<LeadFieldErrors>({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const submissionLockRef =
    useRef(false);

  function clearFieldError(
    field: keyof EditLeadFormData,
  ) {
    setFieldErrors(
      (currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors;
        }

        const nextErrors = {
          ...currentErrors,
        };

        delete nextErrors[field];

        return nextErrors;
      },
    );

    setFormError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    setFormError("");

    const clientResult =
      editLeadSchema.safeParse({
        fullName,
        email,
        phone: phone ?? "",
        interestedCourseId,
        assignedCounselorId,
      });

    if (!clientResult.success) {
      const errors =
        z.flattenError(
          clientResult.error,
        );

      setFieldErrors({
        fullName:
          errors.fieldErrors
            .fullName?.[0],

        email:
          errors.fieldErrors
            .email?.[0],

        phone:
          errors.fieldErrors
            .phone?.[0],

        interestedCourseId:
          errors.fieldErrors
            .interestedCourseId?.[0],

        assignedCounselorId:
          errors.fieldErrors
            .assignedCounselorId?.[0],
      });

      setFormError(
        "Please correct the highlighted fields.",
      );

      return;
    }

    setFieldErrors({});

    submissionLockRef.current =
      true;

    setIsSubmitting(true);

    try {
      const serverResult =
        await updateLead(
          leadId,
          clientResult.data,
        );

      if (!serverResult.success) {
        const serverFieldErrors =
          serverResult.fieldErrors as LeadFieldErrors;

        setFieldErrors(
          serverFieldErrors,
        );

        setFormError(
          serverResult.message,
        );

        return;
      }

      toast({
        variant: "success",

        title: "Lead updated",

        description:
          canManageAssignments
            ? assignedCounselorId === ""
              ? "The lead was updated and is currently unassigned."
              : "The lead was updated and assigned successfully."
            : "The lead details were updated successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Lead update failed:",
        error,
      );

      setFormError(
        "An unexpected error occurred while updating the lead.",
      );
    } finally {
      submissionLockRef.current =
        false;

      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form
          noValidate
          aria-busy={isSubmitting}
          onSubmit={handleSubmit}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-fullName"
              label="Full name"
              required
              error={
                fieldErrors.fullName
              }
            >
              <Input
                id="edit-fullName"
                name="fullName"
                autoComplete="name"
                disabled={
                  isSubmitting
                }
                value={fullName}
                invalid={Boolean(
                  fieldErrors.fullName,
                )}
                onChange={(event) => {
                  setFullName(
                    event.target.value,
                  );

                  clearFieldError(
                    "fullName",
                  );
                }}
                placeholder="Enter full name"
              />
            </Field>

            <Field
              id="edit-email"
              label="Email address"
              required
              error={
                fieldErrors.email
              }
            >
              <Input
                id="edit-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={
                  isSubmitting
                }
                value={email}
                invalid={Boolean(
                  fieldErrors.email,
                )}
                onChange={(event) => {
                  setEmail(
                    event.target.value,
                  );

                  clearFieldError(
                    "email",
                  );
                }}
                placeholder="student@example.com"
              />
            </Field>

            <Field
              id="edit-phone"
              label="Phone number"
              required
              error={
                fieldErrors.phone
              }
              helpText="Select the correct country before entering the phone number."
              className="grid min-w-0 gap-2"
            >
              <InternationalPhoneField
                id="edit-phone"
                name="phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value);

                  clearFieldError(
                    "phone",
                  );
                }}
                invalid={Boolean(
                  fieldErrors.phone,
                )}
              />
            </Field>

            <Field
              id="edit-interestedCourseId"
              label="Interested course"
              required
              error={
                fieldErrors
                  .interestedCourseId
              }
            >
              <Select
                id="edit-interestedCourseId"
                name="interestedCourseId"
                value={
                  interestedCourseId
                }
                disabled={
                  isSubmitting ||
                  courses.length === 0
                }
                invalid={Boolean(
                  fieldErrors
                    .interestedCourseId,
                )}
                onChange={(event) => {
                  setInterestedCourseId(
                    event.target.value,
                  );

                  clearFieldError(
                    "interestedCourseId",
                  );
                }}
              >
                <option value="">
                  {courses.length === 0
                    ? "No active courses available"
                    : "Select a course"}
                </option>

                {courses.map(
                  (course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.title}
                    </option>
                  ),
                )}
              </Select>
            </Field>

            {canManageAssignments && (
              <Field
                id="edit-assignedCounselorId"
                label="Assigned counselor"
                error={
                  fieldErrors
                    .assignedCounselorId
                }
                helpText="Leave this unassigned until a counselor is selected."
                className="grid gap-2 sm:col-span-2"
              >
                <Select
                  id="edit-assignedCounselorId"
                  name="assignedCounselorId"
                  value={
                    assignedCounselorId
                  }
                  disabled={
                    isSubmitting
                  }
                  invalid={Boolean(
                    fieldErrors
                      .assignedCounselorId,
                  )}
                  onChange={(
                    event,
                  ) => {
                    setAssignedCounselorId(
                      event.target.value,
                    );

                    clearFieldError(
                      "assignedCounselorId",
                    );
                  }}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {counselors.map(
                    (counselor) => (
                      <option
                        key={
                          counselor.id
                        }
                        value={
                          counselor.id
                        }
                      >
                        {
                          counselor.fullName
                        }
                      </option>
                    ),
                  )}
                </Select>
              </Field>
            )}
          </div>

          {courses.length === 0 && (
            <div
              role="alert"
              className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
            >
              At least one active
              course is required
              before this lead can be
              updated.
            </div>
          )}

          {canManageAssignments &&
            counselors.length === 0 && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                No active counselors
                are available. The
                lead can remain
                unassigned.
              </div>
            )}

          {formError && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              isLoading={
                isSubmitting
              }
              disabled={
                courses.length === 0
              }
            >
              {isSubmitting
                ? "Saving changes..."
                : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}