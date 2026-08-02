"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Value } from "react-phone-number-input";
import * as z from "zod";

import { updateLead } from "@/actions/update-lead";
import InternationalPhoneField from "@/components/InternationalPhoneField";
import {
  leadFormSchema,
  type LeadFormData,
} from "@/schemas/lead-schema";

type EditLeadFormProps = {
  leadId: string;
  initialData: LeadFormData;
};

type LeadFieldErrors = Partial<
  Record<keyof LeadFormData, string>
>;

type SubmissionFeedback = {
  type: "idle" | "success" | "error";
  message: string;
};

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 transition focus:border-[#001B31] focus:outline-none focus:ring-2 focus:ring-[#F9901C]/40 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function getInputClassName(error?: string) {
  return `${inputClassName} ${
    error
      ? "border-red-500 focus:border-red-600 focus:ring-red-500/25"
      : ""
  }`;
}

export default function EditLeadForm({
  leadId,
  initialData,
}: EditLeadFormProps) {
  const [fullName, setFullName] = useState(
    initialData.fullName,
  );

  const [email, setEmail] = useState(
    initialData.email,
  );

  const [phone, setPhone] = useState<
    Value | undefined
  >(initialData.phone as Value);

  const [interestedCourse, setInterestedCourse] =
    useState(initialData.interestedCourse);

  const [fieldErrors, setFieldErrors] =
    useState<LeadFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submissionFeedback, setSubmissionFeedback] =
    useState<SubmissionFeedback>({
      type: "idle",
      message: "",
    });

  const submissionLockRef = useRef(false);

  function clearFieldError(field: keyof LeadFormData) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];

      return nextErrors;
    });

    if (submissionFeedback.type !== "idle") {
      setSubmissionFeedback({
        type: "idle",
        message: "",
      });
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    setSubmissionFeedback({
      type: "idle",
      message: "",
    });

    const clientResult = leadFormSchema.safeParse({
      fullName,
      email,
      phone: phone ?? "",
      interestedCourse,
    });

    if (!clientResult.success) {
      const flattenedErrors = z.flattenError(
        clientResult.error,
      );

      setFieldErrors({
        fullName:
          flattenedErrors.fieldErrors.fullName?.[0],
        email:
          flattenedErrors.fieldErrors.email?.[0],
        phone:
          flattenedErrors.fieldErrors.phone?.[0],
        interestedCourse:
          flattenedErrors.fieldErrors
            .interestedCourse?.[0],
      });

      setSubmissionFeedback({
        type: "error",
        message:
          "Please correct the highlighted fields.",
      });

      return;
    }

    setFieldErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);

    try {
      const serverResult = await updateLead(
        leadId,
        clientResult.data,
      );

      if (!serverResult.success) {
        setFieldErrors(serverResult.fieldErrors);

        setSubmissionFeedback({
          type: "error",
          message: serverResult.message,
        });

        return;
      }

      setFullName(serverResult.data.fullName);
      setEmail(serverResult.data.email);
      setPhone(serverResult.data.phone as Value);
      setInterestedCourse(
        serverResult.data.interestedCourse,
      );

      setSubmissionFeedback({
        type: "success",
        message: serverResult.message,
      });
    } catch (error) {
      console.error("Lead update failed:", error);

      setSubmissionFeedback({
        type: "error",
        message:
          "An unexpected error occurred while updating the lead.",
      });
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
      className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          Edit lead
        </p>

        <h2 className="mt-2 text-xl font-semibold text-[#001B31]">
          Update lead information
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Update the student&apos;s contact information
          and course interest.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="edit-fullName"
            className="text-sm font-medium text-slate-700"
          >
            Full name
          </label>

          <input
            id="edit-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            disabled={isSubmitting}
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              clearFieldError("fullName");
            }}
            className={getInputClassName(
              fieldErrors.fullName,
            )}
            placeholder="Enter full name"
            aria-invalid={Boolean(
              fieldErrors.fullName,
            )}
            aria-describedby={
              fieldErrors.fullName
                ? "edit-fullName-error"
                : undefined
            }
          />

          {fieldErrors.fullName && (
            <p
              id="edit-fullName-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="edit-email"
            className="text-sm font-medium text-slate-700"
          >
            Email address
          </label>

          <input
            id="edit-email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            className={getInputClassName(
              fieldErrors.email,
            )}
            placeholder="student@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email
                ? "edit-email-error"
                : undefined
            }
          />

          {fieldErrors.email && (
            <p
              id="edit-email-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-2">
          <label
            htmlFor="edit-phone"
            className="text-sm font-medium text-slate-700"
          >
            Phone number
          </label>

          <InternationalPhoneField
            id="edit-phone"
            name="phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearFieldError("phone");
            }}
            invalid={Boolean(fieldErrors.phone)}
            describedBy={
              fieldErrors.phone
                ? "edit-phone-error edit-phone-help"
                : "edit-phone-help"
            }
          />

          {fieldErrors.phone && (
            <p
              id="edit-phone-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.phone}
            </p>
          )}

          <p
            id="edit-phone-help"
            className="text-xs leading-5 text-slate-500"
          >
            Select the correct country before entering
            the phone number.
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="edit-interestedCourse"
            className="text-sm font-medium text-slate-700"
          >
            Interested course
          </label>

          <input
            id="edit-interestedCourse"
            name="interestedCourse"
            type="text"
            disabled={isSubmitting}
            value={interestedCourse}
            onChange={(event) => {
              setInterestedCourse(event.target.value);
              clearFieldError("interestedCourse");
            }}
            className={getInputClassName(
              fieldErrors.interestedCourse,
            )}
            placeholder="AI Engineering"
            aria-invalid={Boolean(
              fieldErrors.interestedCourse,
            )}
            aria-describedby={
              fieldErrors.interestedCourse
                ? "edit-interestedCourse-error"
                : undefined
            }
          />

          {fieldErrors.interestedCourse && (
            <p
              id="edit-interestedCourse-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.interestedCourse}
            </p>
          )}
        </div>
      </div>

      {submissionFeedback.type !== "idle" && (
        <div
          role={
            submissionFeedback.type === "error"
              ? "alert"
              : "status"
          }
          aria-live="polite"
          className={`mt-6 rounded-lg border p-3 text-sm ${
            submissionFeedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {submissionFeedback.message}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#001B31] px-5 py-3 font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting
            ? "Saving changes..."
            : "Save changes"}
        </button>
      </div>
    </form>
  );
}