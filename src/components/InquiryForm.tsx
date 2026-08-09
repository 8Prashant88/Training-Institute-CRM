"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";

import type {
  Value,
} from "react-phone-number-input";

import * as z from "zod";

import {
  submitLead,
  type SubmitLeadInput,
} from "@/actions/submit-lead";

import InternationalPhoneField from "@/components/InternationalPhoneField";
import Button from "@/components/ui/Button";
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

import type {
  Lead,
} from "@/types/lead";

const leadSourceValues = [
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "PHONE_INQUIRY",
  "EVENT",
] as const;

const leadSourceOptions: Array<{
  value:
    SubmitLeadInput["source"];

  label: string;
}> = [
  {
    value: "WEBSITE",
    label: "Website",
  },
  {
    value: "REFERRAL",
    label: "Referral",
  },
  {
    value: "WALK_IN",
    label: "Walk-in",
  },
  {
    value: "SOCIAL_MEDIA",
    label: "Social Media",
  },
  {
    value: "PHONE_INQUIRY",
    label: "Phone Inquiry",
  },
  {
    value: "EVENT",
    label: "Event",
  },
];

const internalLeadFormSchema =
  leadFormSchema
    .omit({
      interestedCourse: true,
    })
    .extend({
      interestedCourseId:
        z.uuid({
          error:
            "Select a valid course.",
        }),

      source: z.enum(
        leadSourceValues,
        {
          error:
            "Select a valid lead source.",
        },
      ),

      assignedCounselorId:
        z.union([
          z.literal(""),

          z.uuid({
            error:
              "Select a valid counselor.",
          }),
        ]),
    });

type InternalLeadFormData =
  z.infer<
    typeof internalLeadFormSchema
  >;

type LeadFieldErrors =
  Partial<
    Record<
      keyof InternalLeadFormData,
      string
    >
  >;

type InquiryFormProps = {
  courses: CourseOption[];

  counselors:
    CounselorOption[];

  canManageAssignments:
    boolean;

  onCreateLead:
    (lead: Lead) => void;

  onCancel: () => void;
};

export default function InquiryForm({
  courses,
  counselors,
  canManageAssignments,
  onCreateLead,
  onCancel,
}: InquiryFormProps) {
  const { toast } =
    useToast();

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState<
      Value | undefined
    >();

  const [
    interestedCourseId,
    setInterestedCourseId,
  ] = useState("");

  const [
    source,
    setSource,
  ] =
    useState<
      SubmitLeadInput["source"]
    >("WEBSITE");

  const [
    assignedCounselorId,
    setAssignedCounselorId,
  ] = useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<LeadFieldErrors>(
      {},
    );

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

  /*
   * Counselors do NOT require the
   * counselor list because the server
   * assigns the lead automatically.
   */
  const hasRequiredOptions =
    courses.length > 0 &&
    (
      !canManageAssignments ||
      counselors.length > 0
    );

  function clearFieldError(
    field:
      keyof InternalLeadFormData,
  ) {
    setFieldErrors(
      (currentErrors) => {
        if (
          !currentErrors[field]
        ) {
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
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submissionLockRef.current
    ) {
      return;
    }

    setFormError("");

    const clientResult =
      internalLeadFormSchema.safeParse(
        {
          fullName,
          email,
          phone: phone ?? "",
          interestedCourseId,
          source,

          /*
           * Counselor sends empty.
           * Server determines identity.
           */
          assignedCounselorId:
            canManageAssignments
              ? assignedCounselorId
              : "",
        },
      );

    if (
      !clientResult.success
    ) {
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

        source:
          errors.fieldErrors
            .source?.[0],

        assignedCounselorId:
          errors.fieldErrors
            .assignedCounselorId?.[0],
      });

      setFormError(
        "Please correct the highlighted fields.",
      );

      return;
    }

    /*
     * ADMIN UI requires selection.
     * Server checks this again.
     */
    if (
      canManageAssignments &&
      !clientResult.data
        .assignedCounselorId
    ) {
      setFieldErrors({
        assignedCounselorId:
          "Select a counselor.",
      });

      setFormError(
        "Please select a counselor.",
      );

      return;
    }

    setFieldErrors({});

    submissionLockRef.current =
      true;

    setIsSubmitting(true);

    try {
      const serverResult =
        await submitLead(
          clientResult.data,
        );

      if (
        !serverResult.success
      ) {
        setFieldErrors(
          serverResult.fieldErrors,
        );

        setFormError(
          serverResult.message,
        );

        return;
      }

      const createdLead =
        serverResult.data;

      onCreateLead(
        createdLead,
      );

      toast({
        variant: "success",

        title: "Lead added",

        description:
          canManageAssignments
            ? `${createdLead.fullName} was saved to the database.`
            : `${createdLead.fullName} was added and assigned to you.`,
      });
    } catch (error) {
      console.error(
        "Lead submission failed:",
        error,
      );

      setFormError(
        "An unexpected error occurred. Please try again.",
      );
    } finally {
      submissionLockRef.current =
        false;

      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      aria-busy={
        isSubmitting
      }
      onSubmit={
        handleSubmit
      }
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          required
          error={
            fieldErrors.fullName
          }
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            disabled={
              isSubmitting
            }
            value={fullName}
            invalid={Boolean(
              fieldErrors.fullName,
            )}
            onChange={(
              event,
            ) => {
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
          id="email"
          label="Email address"
          required
          error={
            fieldErrors.email
          }
        >
          <Input
            id="email"
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
            onChange={(
              event,
            ) => {
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
          id="phone"
          label="Phone number"
          required
          error={
            fieldErrors.phone
          }
          helpText="Select a country and enter the phone number using its standard format."
          className="grid min-w-0 gap-2"
        >
          <InternationalPhoneField
            id="phone"
            name="phone"
            value={phone}
            onChange={(
              value,
            ) => {
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
          id="interestedCourseId"
          label="Interested course"
          required
          error={
            fieldErrors
              .interestedCourseId
          }
        >
          <Select
            id="interestedCourseId"
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
            onChange={(
              event,
            ) => {
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
                  key={
                    course.id
                  }
                  value={
                    course.id
                  }
                >
                  {
                    course.title
                  }
                </option>
              ),
            )}
          </Select>
        </Field>

        <Field
          id="source"
          label="Lead source"
          required
          error={
            fieldErrors.source
          }
        >
          <Select
            id="source"
            name="source"
            value={source}
            disabled={
              isSubmitting
            }
            invalid={Boolean(
              fieldErrors.source,
            )}
            onChange={(
              event,
            ) => {
              setSource(
                event.target
                  .value as SubmitLeadInput["source"],
              );

              clearFieldError(
                "source",
              );
            }}
          >
            {leadSourceOptions.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              ),
            )}
          </Select>
        </Field>

        {canManageAssignments && (
          <Field
            id="assignedCounselorId"
            label="Assign to"
            required
            error={
              fieldErrors
                .assignedCounselorId
            }
          >
            <Select
              id="assignedCounselorId"
              name="assignedCounselorId"
              value={
                assignedCounselorId
              }
              disabled={
                isSubmitting ||
                counselors.length ===
                  0
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
                {counselors.length ===
                0
                  ? "No active counselors available"
                  : "Select a counselor"}
              </option>

              {counselors.map(
                (
                  counselor,
                ) => (
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

        {!canManageAssignments && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 sm:self-end">
            This lead will be
            automatically assigned
            to you.
          </div>
        )}
      </div>

      {!hasRequiredOptions && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
        >
          {canManageAssignments
            ? "At least one active course and one active counselor are required before a lead can be added."
            : "At least one active course is required before a lead can be added."}
        </div>
      )}

      {formError && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={
            isSubmitting
          }
        >
          Cancel
        </Button>

        <Button
          type="submit"
          isLoading={
            isSubmitting
          }
          disabled={
            !hasRequiredOptions
          }
        >
          {isSubmitting
            ? "Adding lead..."
            : "Add lead"}
        </Button>
      </div>
    </form>
  );
}