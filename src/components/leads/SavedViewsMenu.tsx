"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  createSavedViewAction,
  deleteSavedViewAction,
} from "@/actions/saved-views";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

import {
  createLeadListSearchParams,
  type LeadListQuery,
} from "@/lib/lead-list-query";

export type SavedView = {
  id: string;
  name: string;
  query: Omit<LeadListQuery, "page" | "pageSize">;
};

/**
 * A saved view is a filter combination, not a page number — strip
 * `page`/`pageSize` via delete rather than hand-listing every other
 * field, so a new LeadListQuery field flows through automatically
 * instead of silently being dropped from saved views until someone
 * remembers to list it here too.
 */
function toSavedViewQuery(
  query: LeadListQuery,
): Omit<LeadListQuery, "page" | "pageSize"> {
  const clone: Partial<LeadListQuery> = { ...query };

  delete clone.page;
  delete clone.pageSize;

  return clone as Omit<LeadListQuery, "page" | "pageSize">;
}

type SavedViewsMenuProps = {
  views: SavedView[];
  currentQuery: LeadListQuery;
};

export default function SavedViewsMenu({
  views,
  currentQuery,
}: SavedViewsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  function applyView(view: SavedView) {
    setOpen(false);

    const params = createLeadListSearchParams({
      ...view.query,
      page: 1,
      pageSize: currentQuery.pageSize,
    });

    const search = params.toString();

    router.push(search ? `/dashboard/leads?${search}` : "/dashboard/leads");
  }

  async function handleSave() {
    const trimmed = name.trim();

    if (!trimmed || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await createSavedViewAction({
        name: trimmed,
        query: toSavedViewQuery(currentQuery),
      });

      if (!result.success) {
        toast({
          variant: "error",
          title: "View not saved",
          description: result.message,
        });

        return;
      }

      toast({ variant: "success", title: "View saved" });
      setIsSaveOpen(false);
      setName("");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(view: SavedView) {
    if (deletingId) {
      return;
    }

    setDeletingId(view.id);

    try {
      const result = await deleteSavedViewAction({ id: view.id });

      if (!result.success) {
        toast({
          variant: "error",
          title: "View not removed",
          description: result.message,
        });

        return;
      }

      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
      >
        <Bookmark aria-hidden="true" className="size-4" />
        Views
        <ChevronDown aria-hidden="true" className="size-4 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[var(--shadow-popover)] animate-[var(--animate-fade-in)]"
        >
          {views.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-slate-500">
              No saved views yet.
            </p>
          ) : (
            <div className="grid gap-0.5">
              {views.map((view) => (
                <div
                  key={view.id}
                  className="flex items-center justify-between gap-1 rounded-lg px-1 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => applyView(view)}
                    className="flex-1 truncate rounded-lg px-1.5 py-2 text-left text-sm text-slate-700"
                  >
                    {view.name}
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${view.name}`}
                    disabled={deletingId === view.id}
                    onClick={() => void handleDelete(view)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="my-1 h-px bg-slate-100" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setIsSaveOpen(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-primary-800 transition hover:bg-slate-50"
          >
            <Plus aria-hidden="true" className="size-4" />
            Save current filters
          </button>
        </div>
      )}

      <Dialog
        open={isSaveOpen}
        onClose={() => !isSaving && setIsSaveOpen(false)}
        titleId="save-view-title"
        size="sm"
      >
        <h2
          id="save-view-title"
          className="text-xl font-semibold text-primary-900"
        >
          Save current filters
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Give this filter combination a name so you can jump back to it
          later.
        </p>

        <div className="mt-4">
          <Input
            autoFocus
            value={name}
            placeholder="e.g. My hot leads this week"
            maxLength={60}
            disabled={isSaving}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSave();
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            disabled={isSaving}
            onClick={() => setIsSaveOpen(false)}
          >
            Cancel
          </Button>

          <Button
            isLoading={isSaving}
            disabled={!name.trim()}
            onClick={() => void handleSave()}
          >
            Save view
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
