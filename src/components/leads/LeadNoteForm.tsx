"use client";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import {
  submitLeadNote,
} from "@/actions/create-lead-note";

import Button from "@/components/ui/Button";
import {
  Textarea,
} from "@/components/ui/Input";
import {
  useToast,
} from "@/components/ui/Toast";

type LeadNoteFormProps = {
  leadId: string;
};

type FieldErrors = {
  note?: string;
};

export default function LeadNoteForm({
  leadId,
}: LeadNoteFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [note, setNote] =
    useState("");

  const [
    fieldErrors,
    setFieldErrors,
  ] = useState<FieldErrors>({});

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const submissionLockRef =
    useRef(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submissionLockRef.current) {
      return;
    }

    submissionLockRef.current = true;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const result =
        await submitLeadNote({
          leadId,
          note,
        });

      if (!result.success) {
        setFieldErrors({
          note:
            result.fieldErrors.note,
        });

        toast({
          variant: "error",
          title: "Note not added",
          description:
            result.message,
        });

        return;
      }

      setNote("");

      toast({
        variant: "success",
        title: "Note added",
        description:
          "Your note was saved successfully.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "Lead note submission failed",
        error,
      );

      toast({
        variant: "error",
        title: "Note not added",
        description:
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      submissionLockRef.current =
        false;

      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div>
        <h3 className="text-base font-semibold text-primary-900">
          Add a note
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Record an update for this
          lead. The note will
          automatically be attributed
          to you.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label
              htmlFor="lead-note"
              className="text-sm font-medium text-slate-700"
            >
              Note
            </label>

            <span className="text-xs text-slate-400">
              {note.length}/2000
            </span>
          </div>

          <Textarea
            id="lead-note"
            value={note}
            rows={5}
            maxLength={2000}
            disabled={isSubmitting}
            invalid={Boolean(
              fieldErrors.note,
            )}
            placeholder="Write the latest discussion, concern, or follow-up update..."
            aria-describedby={
              fieldErrors.note
                ? "lead-note-error"
                : "lead-note-help"
            }
            onChange={(event) => {
              setNote(
                event.target.value,
              );

              setFieldErrors(
                (current) => ({
                  ...current,
                  note: undefined,
                }),
              );
            }}
          />

          {fieldErrors.note ? (
            <p
              id="lead-note-error"
              role="alert"
              className="mt-1.5 text-sm text-red-600"
            >
              {fieldErrors.note}
            </p>
          ) : (
            <p
              id="lead-note-help"
              className="mt-1.5 text-xs text-slate-500"
            >
              Minimum 3 characters.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            {isSubmitting
              ? "Saving note..."
              : "Add note"}
          </Button>
        </div>
      </div>
    </form>
  );
}