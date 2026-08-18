"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { CheckCircle2 } from "lucide-react";
import type { Value } from "react-phone-number-input";
import * as z from "zod";

import { submitPublicInquiry } from "@/actions/submit-public-inquiry";
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
  Textarea,
} from "@/components/ui/Input";
import {
  publicInquirySchema,
  type PublicInquiryFormData,
} from "@/schemas/lead-schema";

type PublicCourseOption = {
  id: string;
  title: string;
};

type PublicInquiryFormProps = {
  courses: PublicCourseOption[];
};

type PublicInquiryFieldErrors = Partial<
  Record<keyof PublicInquiryFormData, string>
>;

export default function PublicInquiryForm({
  courses,
}: PublicInquiryFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] =
    useState<Value | undefined>();
  const [
    interestedCourseId,
    setInterestedCourseId,
  ] = useState("");
  const [message, setMessage] = useState("");

  const [fieldErrors, setFieldErrors] =
    useState<PublicInquiryFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [isSubmitted, setIsSubmitted] =
    useState(false);
  const [formError, setFormError] = useState("");

  const submissionLockRef = useRef(false);

  function clearFieldError(
    field: keyof PublicInquiryFormData,
  ) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = {
        ...currentErrors,
      };

      delete nextErrors[field];

      return nextErrors;
    });

    setFormError("");
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setPhone(undefined);
    setInterestedCourseId("");
    setMessage("");
    setFieldErrors({});
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
      publicInquirySchema.safeParse({
        fullName,
        email,
        phone: phone ?? "",
        interestedCourseId,
        message,
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

        interestedCourseId:
          flattenedErrors.fieldErrors
            .interestedCourseId?.[0],

        message:
          flattenedErrors.fieldErrors.message?.[0],
      });

      setFormError(
        "Please correct the highlighted fields.",
      );

      return;
    }

    setFieldErrors({});
    submissionLockRef.current = true;
    setIsSubmitting(true);

    try {
      const serverResult =
        await submitPublicInquiry(
          clientResult.data,
        );

      if (!serverResult.success) {
        setFieldErrors(serverResult.fieldErrors);
        setFormError(serverResult.message);

        return;
      }

      resetForm();
      setIsSubmitted(true);
    } catch (error) {
      console.error(
        "Public inquiry submission failed:",
        error,
      );

      setFormError(
        "An unexpected error occurred. Please try again.",
      );
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center sm:p-10">
        <div className="relative flex size-14 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-green-400/30 blur-xl"
          />

          <div
            aria-hidden="true"
            className="relative flex size-14 items-center justify-center rounded-full bg-green-100 text-green-600"
          >
            <CheckCircle2 className="size-7" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-primary-900">
          Thank you for reaching out
        </h2>

        <p className="max-w-sm text-sm leading-6 text-slate-600">
          Your inquiry has been received. Our team
          will contact you soon with course details.
        </p>

        <Button
          variant="outline"
          onClick={() => setIsSubmitted(false)}
        >
          Submit another inquiry
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-accent-500 via-accent-400 to-primary-700"
      />

      <CardContent>
        <form
          noValidate
          aria-busy={isSubmitting}
          onSubmit={handleSubmit}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
              Course inquiry
            </p>

            <h2 className="mt-2 text-2xl font-bold text-primary-900">
              Start your learning journey
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Submit your details and our team will
              contact you with course information.
            </p>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field
              id="public-fullName"
              label="Full name"
              required
              error={fieldErrors.fullName}
            >
              <Input
                id="public-fullName"
                name="fullName"
                autoComplete="name"
                disabled={isSubmitting}
                value={fullName}
                invalid={Boolean(
                  fieldErrors.fullName,
                )}
                onChange={(event) => {
                  setFullName(event.target.value);
                  clearFieldError("fullName");
                }}
                placeholder="Enter your full name"
              />
            </Field>

            <Field
              id="public-email"
              label="Email address"
              required
              error={fieldErrors.email}
            >
              <Input
                id="public-email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                invalid={Boolean(
                  fieldErrors.email,
                )}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearFieldError("email");
                }}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              id="public-phone"
              label="Phone number"
              required
              error={fieldErrors.phone}
              helpText="Select your country and enter a valid phone number."
              className="grid min-w-0 gap-2"
            >
              <InternationalPhoneField
                id="public-phone"
                name="phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  clearFieldError("phone");
                }}
                invalid={Boolean(
                  fieldErrors.phone,
                )}
              />
            </Field>

            <Field
              id="public-interestedCourseId"
              label="Interested course"
              required
              error={
                fieldErrors.interestedCourseId
              }
            >
              <Select
                id="public-interestedCourseId"
                name="interestedCourseId"
                disabled={
                  isSubmitting ||
                  courses.length === 0
                }
                value={interestedCourseId}
                invalid={Boolean(
                  fieldErrors.interestedCourseId,
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
                    ? "No courses currently available"
                    : "Select a course"}
                </option>

                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              id="public-message"
              label="Message"
              required
              error={fieldErrors.message}
              className="grid gap-2 sm:col-span-2"
              trailing={
                <span className="text-xs text-slate-500">
                  {message.length}/1000
                </span>
              }
            >
              <Textarea
                id="public-message"
                name="message"
                rows={5}
                maxLength={1000}
                disabled={isSubmitting}
                value={message}
                invalid={Boolean(
                  fieldErrors.message,
                )}
                onChange={(event) => {
                  setMessage(event.target.value);
                  clearFieldError("message");
                }}
                placeholder="Tell us what you would like to learn..."
              />
            </Field>
          </div>

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
              size="lg"
              isLoading={isSubmitting}
              disabled={courses.length === 0}
            >
              {isSubmitting
                ? "Submitting inquiry..."
                : "Submit inquiry"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}