"use client";

import { TriangleAlert } from "lucide-react";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      titleId="confirmation-dialog-title"
      descriptionId="confirmation-dialog-description"
    >
      <div
        aria-hidden="true"
        className={
          tone === "danger"
            ? "flex size-11 items-center justify-center rounded-full bg-red-100 text-red-600"
            : "flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-800"
        }
      >
        <TriangleAlert className="size-5" />
      </div>

      <h2
        id="confirmation-dialog-title"
        className="mt-4 text-xl font-semibold text-primary-900"
      >
        {title}
      </h2>

      <p
        id="confirmation-dialog-description"
        className="mt-2 text-sm leading-6 text-slate-600"
      >
        {description}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" autoFocus onClick={onCancel}>
          {cancelLabel}
        </Button>

        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
