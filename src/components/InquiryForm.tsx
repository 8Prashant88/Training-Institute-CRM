"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Value } from "react-phone-number-input";
import * as z from "zod";

import { submitLead } from "@/actions/submit-lead";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import InternationalPhoneField from "@/components/InternationalPhoneField";
import {
  leadFormSchema,
  type LeadFormData,
} from "@/schemas/lead-schema";
import { counselors } from "@/data/leads";
import { leadSources, type Lead, type LeadSource } from "@/types/lead";

type InquiryFormProps = {
  onCreateLead: (lead: Lead) => void;
  onCancel: () => void;
};

type LeadFieldErrors = Partial<Record<keyof LeadFormData, string>>;

export default function InquiryForm({
  onCreateLead,
  onCancel,
}: InquiryFormProps) {
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<Value | undefined>();
  const [interestedCourse, setInterestedCourse] = useState("");
  const [source, setSource] = useState<LeadSource>("Website");
  const [assignedTo, setAssignedTo] = useState(counselors[0]);

  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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

    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    setFormError("");

    const clientResult = leadFormSchema.safeParse({
      fullName,
      email,
      phone: phone ?? "",
      interestedCourse,
    });

    if (!clientResult.success) {
      const flattenedErrors = z.flattenError(clientResult.error);

      setFieldErrors({
        fullName: flattenedErrors.fieldErrors.fullName?.[0],
        email: flattenedErrors.fieldErrors.email?.[0],
        phone: flattenedErrors.fieldErrors.phone?.[0],
        interestedCourse:
          flattenedErrors.fieldErrors.interestedCourse?.[0],
      });

      setFormError("Please correct the highlighted fields.");

      return;
    }

    setFieldErrors({});

    submissionLockRef.current = true;
    setIsSubmitting(true);

    try {
      const serverResult = await submitLead(clientResult.data);

      if (!serverResult.success) {
        setFieldErrors(serverResult.fieldErrors);
        setFormError(serverResult.message);

        return;
      }

      const newLead: Lead = {
        id: crypto.randomUUID(),
        ...serverResult.data,
        status: "NEW",
        source,
        assignedTo,
        createdAt: new Date().toISOString(),
      };

      onCreateLead(newLead);

      toast({
        variant: "success",
        title: "Lead added",
        description: `${newLead.fullName} was added to the pipeline.`,
      });
    } catch {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="fullName" label="Full name" required error={fieldErrors.fullName}>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            disabled={isSubmitting}
            value={fullName}
            invalid={Boolean(fieldErrors.fullName)}
            onChange={(event) => {
              setFullName(event.target.value);
              clearFieldError("fullName");
            }}
            placeholder="Enter full name"
          />
        </Field>

        <Field id="email" label="Email address" required error={fieldErrors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            value={email}
            invalid={Boolean(fieldErrors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            placeholder="student@example.com"
          />
        </Field>

        <Field
          id="phone"
          label="Phone number"
          required
          error={fieldErrors.phone}
          helpText="Select a country and enter the phone number using its standard format."
          className="grid min-w-0 gap-2"
        >
          <InternationalPhoneField
            id="phone"
            name="phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              clearFieldError("phone");
            }}
            invalid={Boolean(fieldErrors.phone)}
          />
        </Field>

        <Field
          id="interestedCourse"
          label="Interested course"
          required
          error={fieldErrors.interestedCourse}
        >
          <Input
            id="interestedCourse"
            name="interestedCourse"
            disabled={isSubmitting}
            value={interestedCourse}
            invalid={Boolean(fieldErrors.interestedCourse)}
            onChange={(event) => {
              setInterestedCourse(event.target.value);
              clearFieldError("interestedCourse");
            }}
            placeholder="AI Engineering"
          />
        </Field>

        <Field id="source" label="Lead source" required>
          <Select
            id="source"
            value={source}
            disabled={isSubmitting}
            onChange={(event) =>
              setSource(event.target.value as LeadSource)
            }
          >
            {leadSources.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="assignedTo" label="Assign to" required>
          <Select
            id="assignedTo"
            value={assignedTo}
            disabled={isSubmitting}
            onChange={(event) => setAssignedTo(event.target.value)}
          >
            {counselors.map((counselor) => (
              <option key={counselor} value={counselor}>
                {counselor}
              </option>
            ))}
          </Select>
        </Field>
      </div>

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
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Adding lead..." : "Add lead"}
        </Button>
      </div>
    </form>
  );
}
