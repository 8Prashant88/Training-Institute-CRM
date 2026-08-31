"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { createTagAction } from "@/actions/manage-tags";
import { updateLeadTagsAction } from "@/actions/update-lead-tags";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { LeadTag } from "@/types/lead";

type LeadTagsControlProps = {
  leadId: string;
  tags: LeadTag[];
  allTags: LeadTag[];
  canCreateTags: boolean;
};

export default function LeadTagsControl({
  leadId,
  tags,
  allTags,
  canCreateTags,
}: LeadTagsControlProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(tags.map((tag) => tag.id)),
  );
  const [tagOptions, setTagOptions] = useState<LeadTag[]>(allTags);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  function openDialog() {
    setSelectedIds(new Set(tags.map((tag) => tag.id)));
    setTagOptions(allTags);
    setNewTagName("");
    setIsOpen(true);
  }

  function toggleTag(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  async function handleCreateTag() {
    const name = newTagName.trim();

    if (!name || isCreatingTag) {
      return;
    }

    setIsCreatingTag(true);

    try {
      const result = await createTagAction({ name });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Tag not created",
          description: result.message,
        });

        return;
      }

      setTagOptions((current) => [...current, result.data].sort((a, b) =>
        a.name.localeCompare(b.name),
      ));

      setSelectedIds((current) => new Set(current).add(result.data.id));
      setNewTagName("");
    } finally {
      setIsCreatingTag(false);
    }
  }

  async function handleSave() {
    setIsSubmitting(true);

    try {
      const result = await updateLeadTagsAction({
        leadId,
        tagIds: [...selectedIds],
      });

      if (!result.success) {
        toast({
          variant: "error",
          title: "Tags not updated",
          description: result.message,
        });

        return;
      }

      toast({ variant: "success", title: "Tags updated" });
      setIsOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Badge key={tag.id} tone="slate">
            {tag.name}
          </Badge>
        ))}

        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
        >
          <Plus aria-hidden="true" className="size-3" />
          {tags.length === 0 ? "Add tags" : "Edit"}
        </button>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        titleId="edit-lead-tags-title"
        size="sm"
      >
        <h2
          id="edit-lead-tags-title"
          className="text-xl font-semibold text-primary-900"
        >
          Edit tags
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {tagOptions.length === 0 && (
            <p className="text-sm text-slate-500">
              No tags exist yet{canCreateTags ? " — create one below." : "."}
            </p>
          )}

          {tagOptions.map((tag) => {
            const isSelected = selectedIds.has(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  isSelected
                    ? "border-primary-900 bg-primary-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tag.name}
                {isSelected && <X aria-hidden="true" className="size-3" />}
              </button>
            );
          })}
        </div>

        {canCreateTags && (
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
            <Input
              value={newTagName}
              placeholder="New tag name"
              maxLength={40}
              disabled={isCreatingTag}
              onChange={(event) => setNewTagName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreateTag();
                }
              }}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!newTagName.trim() || isCreatingTag}
              onClick={() => void handleCreateTag()}
            >
              Create
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button
            isLoading={isSubmitting}
            onClick={() => void handleSave()}
          >
            Save
          </Button>
        </div>
      </Dialog>
    </>
  );
}
