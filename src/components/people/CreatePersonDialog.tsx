"use client";

import { useState, type FormEvent } from "react";

import { submitCreatePerson } from "@/actions/create-person";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Field from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import type { PersonRole } from "@/types/people";

type FormValues = {
  fullName: string;
  email: string;
  role: PersonRole;
};

type FieldErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  fullName: "",
  email: "",
  role: "COUNSELOR",
};

type CreatePersonDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
};

export default function CreatePersonDialog({
  open,
  onClose,
  onCreated,
}: CreatePersonDialogProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reset() {
    setValues(initialValues);
    setFieldErrors({});
    setGeneralError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError("");

    try {
      const result = await submitCreatePerson(values);

      if (!result.success) {
        setFieldErrors(result.fieldErrors);
        setGeneralError(result.message);
        return;
      }

      onCreated(result.message);
      handleClose();
    } catch (error) {
      console.error("Create person submission failed", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      titleId="create-person-title"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <h2
          id="create-person-title"
          className="text-lg font-semibold text-primary-900"
        >
          Add a person
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Create an administrator or counselor account for your team.
        </p>

        {generalError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {generalError}
          </div>
        )}

        <div className="mt-4 grid gap-4">
          <Field
            id="person-name"
            label="Full name"
            required
            error={fieldErrors.fullName}
          >
            <Input
              id="person-name"
              value={values.fullName}
              disabled={isSubmitting}
              invalid={Boolean(fieldErrors.fullName)}
              placeholder="Aarav Sharma"
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </Field>

          <Field
            id="person-email"
            label="Email address"
            required
            error={fieldErrors.email}
            helpText="They can sign in with Google using this same email."
          >
            <Input
              id="person-email"
              type="email"
              value={values.email}
              disabled={isSubmitting}
              invalid={Boolean(fieldErrors.email)}
              placeholder="counselor@example.com"
              onChange={(event) => updateField("email", event.target.value)}
            />
          </Field>

          <Field id="person-role" label="Role" required>
            <Select
              id="person-role"
              value={values.role}
              disabled={isSubmitting}
              onChange={(event) => updateField("role", event.target.value)}
            >
              <option value="COUNSELOR">Counselor</option>
              <option value="ADMIN">Administrator</option>
            </Select>
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add person"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
