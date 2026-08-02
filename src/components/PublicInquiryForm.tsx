"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { Value } from "react-phone-number-input";

import { submitPublicInquiry } from "@/actions/submit-public-inquiry";
import InternationalPhoneField from "@/components/InternationalPhoneField";
import {
  publicInquirySchema,
  type PublicInquiryFormData,
} from "@/schemas/lead-schema";

type PublicInquiryFieldErrors = Partial<
  Record<keyof PublicInquiryFormData, string>
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

export default function PublicInquiryForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] =
    useState<Value | undefined>();
  const [interestedCourse, setInterestedCourse] =
    useState("");
  const [message, setMessage] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<PublicInquiryFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submissionFeedback, setSubmissionFeedback] =
    useState<SubmissionFeedback>({
      type: "idle",
      message: "",
    });

  const submissionLockRef = useRef(false);

  function clearFieldError(
    field: keyof PublicInquiryFormData,
  ) {
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

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone(undefined);
    setInterestedCourse("");
    setMessage("");
    setFieldErrors({});
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

    const clientResult = publicInquirySchema.safeParse({
      fullName,
      email,
      phone: phone ?? "",
      interestedCourse,
      message,
    });

    if (!clientResult.success) {
      const flattenedErrors =
        clientResult.error.flatten();

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
        message:
          flattenedErrors.fieldErrors.message?.[0],
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
      const serverResult =
        await submitPublicInquiry(clientResult.data);

      if (!serverResult.success) {
        setFieldErrors(serverResult.fieldErrors);

        setSubmissionFeedback({
          type: "error",
          message: serverResult.message,
        });

        return;
      }

      resetForm();

      setSubmissionFeedback({
        type: "success",
        message: serverResult.message,
      });
    } catch (error) {
      console.error(
        "Public inquiry submission failed:",
        error,
      );

      setSubmissionFeedback({
        type: "error",
        message:
          "An unexpected error occurred. Please try again.",
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
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#F9901C]">
          Course inquiry
        </p>

        <h2 className="mt-2 text-2xl font-bold text-[#001B31]">
          Start your learning journey
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Submit your details and our team will contact you
          with course information.
        </p>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            htmlFor="public-fullName"
            className="text-sm font-medium text-slate-700"
          >
            Full name
          </label>

          <input
            id="public-fullName"
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
            placeholder="Enter your full name"
            aria-invalid={Boolean(
              fieldErrors.fullName,
            )}
            aria-describedby={
              fieldErrors.fullName
                ? "public-fullName-error"
                : undefined
            }
          />

          {fieldErrors.fullName && (
            <p
              id="public-fullName-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.fullName}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="public-email"
            className="text-sm font-medium text-slate-700"
          >
            Email address
          </label>

          <input
            id="public-email"
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
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={
              fieldErrors.email
                ? "public-email-error"
                : undefined
            }
          />

          {fieldErrors.email && (
            <p
              id="public-email-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-2">
          <label
            htmlFor="public-phone"
            className="text-sm font-medium text-slate-700"
          >
            Phone number
          </label>

          <InternationalPhoneField
            id="public-phone"
            name="phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearFieldError("phone");
            }}
            invalid={Boolean(fieldErrors.phone)}
            describedBy={
              fieldErrors.phone
                ? "public-phone-error public-phone-help"
                : "public-phone-help"
            }
          />

          {fieldErrors.phone && (
            <p
              id="public-phone-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.phone}
            </p>
          )}

          <p
            id="public-phone-help"
            className="text-xs leading-5 text-slate-500"
          >
            Select your country and enter a valid phone
            number.
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="public-interestedCourse"
            className="text-sm font-medium text-slate-700"
          >
            Interested course
          </label>

          <input
            id="public-interestedCourse"
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
                ? "public-interestedCourse-error"
                : undefined
            }
          />

          {fieldErrors.interestedCourse && (
            <p
              id="public-interestedCourse-error"
              role="alert"
              className="text-sm text-red-600"
            >
              {fieldErrors.interestedCourse}
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label
            htmlFor="public-message"
            className="text-sm font-medium text-slate-700"
          >
            Message
          </label>

          <textarea
            id="public-message"
            name="message"
            rows={5}
            maxLength={1000}
            disabled={isSubmitting}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              clearFieldError("message");
            }}
            className={`${getInputClassName(
              fieldErrors.message,
            )} resize-y`}
            placeholder="Tell us what you would like to learn..."
            aria-invalid={Boolean(
              fieldErrors.message,
            )}
            aria-describedby={
              fieldErrors.message
                ? "public-message-error public-message-count"
                : "public-message-count"
            }
          />

          <div className="flex items-start justify-between gap-4">
            <div>
              {fieldErrors.message && (
                <p
                  id="public-message-error"
                  role="alert"
                  className="text-sm text-red-600"
                >
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <p
              id="public-message-count"
              className="shrink-0 text-xs text-slate-500"
            >
              {message.length}/1000
            </p>
          </div>
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
          className="w-full rounded-lg bg-[#001B31] px-6 py-3 font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9901C] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting
            ? "Submitting inquiry..."
            : "Submit inquiry"}
        </button>
      </div>
    </form>
  );
}
