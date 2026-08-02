"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Value } from "react-phone-number-input";
import * as z from "zod";

import { updateLead } from "@/actions/update-lead";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import InternationalPhoneField from "@/components/InternationalPhoneField";
import {
  leadFormSchema,
  type LeadFormData,
} from "@/schemas/lead-schema";

type EditLeadFormProps = {
  leadId: string;
  initialData: LeadFormData;
};

type LeadFieldErrors = Partial<Record<keyof LeadFormData, string>>;

export default function EditLeadForm({
  leadId,
  initialData,
}: EditLeadFormProps) {
  const { toast } = useToast();

  const [fullName, setFullName] = useState(initialData.fullName);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState<Value | undefined>(
    initialData.phone as Value,
  );
  const [interestedCourse, setInterestedCourse] = useState(
    initialData.interestedCourse,
  );

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
      const serverResult = await updateLead(leadId, clientResult.data);

      if (!serverResult.success) {
        setFieldErrors(serverResult.fieldErrors);
        setFormError(serverResult.message);

        return;
      }

      setFullName(serverResult.data.fullName);
      setEmail(serverResult.data.email);
      setPhone(serverResult.data.phone as Value);
      setInterestedCourse(serverResult.data.interestedCourse);

      toast({
        variant: "success",
        title: "Lead updated",
        description: "The contact details were saved successfully.",
      });
    } catch (error) {
      console.error("Lead update failed:", error);
      setFormError("An unexpected error occurred while updating the lead.");
    } finally {
      submissionLockRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="edit-fullName"
              label="Full name"
              required
              error={fieldErrors.fullName}
            >
              <Input
                id="edit-fullName"
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

            <Field
              id="edit-email"
              label="Email address"
              required
              error={fieldErrors.email}
            >
              <Input
                id="edit-email"
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
              id="edit-phone"
              label="Phone number"
              required
              error={fieldErrors.phone}
              helpText="Select the correct country before entering the phone number."
              className="grid min-w-0 gap-2"
            >
              <InternationalPhoneField
                id="edit-phone"
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
              id="edit-interestedCourse"
              label="Interested course"
              required
              error={fieldErrors.interestedCourse}
            >
              <Input
                id="edit-interestedCourse"
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
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Saving changes..." : "Save changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
