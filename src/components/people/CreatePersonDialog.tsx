"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy } from "lucide-react";

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

type CreatedPerson = {
  fullName: string;
  email: string;
  temporaryPassword: string;
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
  const [created, setCreated] = useState<CreatedPerson | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setValues(initialValues);
    setFieldErrors({});
    setGeneralError("");
    setCreated(null);
    setCopied(false);
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

      setCreated({
        fullName: result.data.fullName,
        email: result.data.email,
        temporaryPassword: result.temporaryPassword,
      });
    } catch (error) {
      console.error("Create person submission failed", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyPassword() {
    if (!created) {
      return;
    }

    await navigator.clipboard.writeText(created.temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    if (created) {
      onCreated(`${created.fullName} was added successfully.`);
    }

    handleClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      titleId="create-person-title"
      size="sm"
    >
      {created ? (
        <div>
          <h2
            id="create-person-title"
            className="text-lg font-semibold text-primary-900"
          >
            Person added
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Share this temporary password with{" "}
            <strong>{created.fullName}</strong> ({created.email}) securely.
            It will not be shown again. They can sign in with it, or use
            &quot;Continue with Google&quot; on the login page with this same
            email.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
            <code className="flex-1 truncate text-sm font-mono text-slate-800">
              {created.temporaryPassword}
            </code>

            <button
              type="button"
              onClick={handleCopyPassword}
              aria-label="Copy temporary password"
              className="shrink-0 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              {copied ? (
                <Check aria-hidden="true" className="size-4 text-green-600" />
              ) : (
                <Copy aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>

          <div className="mt-5 flex justify-end">
            <Button type="button" onClick={handleDone}>
              Done
            </Button>
          </div>
        </div>
      ) : (
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
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
              />
            </Field>

            <Field
              id="person-email"
              label="Email address"
              required
              error={fieldErrors.email}
              helpText="They can sign in with a temporary password, or with Google using this same email."
            >
              <Input
                id="person-email"
                type="email"
                value={values.email}
                disabled={isSubmitting}
                invalid={Boolean(fieldErrors.email)}
                placeholder="counselor@example.com"
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
              />
            </Field>

            <Field id="person-role" label="Role" required>
              <Select
                id="person-role"
                value={values.role}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("role", event.target.value)
                }
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
      )}
    </Dialog>
  );
}
