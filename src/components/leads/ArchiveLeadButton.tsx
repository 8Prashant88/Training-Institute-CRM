"use client";

import {
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";

import { submitArchiveLead } from "@/actions/archive-lead";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type ArchiveLeadButtonProps = {
  leadId: string;
  leadName: string;
};

export default function ArchiveLeadButton({
  leadId,
  leadName,
}: ArchiveLeadButtonProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const [isArchiving, setIsArchiving] =
    useState(false);

  const archiveLockRef = useRef(false);

  async function handleArchive() {
    if (archiveLockRef.current) {
      return;
    }

    archiveLockRef.current = true;
    setIsArchiving(true);

    try {
      const result =
        await submitArchiveLead({
          leadId,
        });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Lead not archived",
          description: result.message,
        });

        return;
      }

      setIsDialogOpen(false);

      toast({
        variant: "success",
        title: "Lead archived",
        description: `${leadName} was removed from the active lead pipeline.`,
      });

      router.push("/dashboard/leads");
      router.refresh();
    } catch (error) {
      console.error(
        "Lead archive failed",
        error,
      );

      toast({
        variant: "error",
        title: "Lead not archived",
        description:
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      archiveLockRef.current = false;
      setIsArchiving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() =>
          setIsDialogOpen(true)
        }
      >
        <Archive
          aria-hidden="true"
          className="size-4"
        />

        Archive lead
      </Button>

      <ConfirmationDialog
        open={isDialogOpen}
        title={`Archive ${leadName}?`}
        description="This lead will disappear from active lead lists, but its information, notes, relationships, and history will remain stored in the database."
        confirmLabel={
          isArchiving
            ? "Archiving..."
            : "Archive lead"
        }
        cancelLabel="Keep lead"
        tone="danger"
        onCancel={() => {
          if (!isArchiving) {
            setIsDialogOpen(false);
          }
        }}
        onConfirm={() => {
          void handleArchive();
        }}
      />
    </>
  );
}